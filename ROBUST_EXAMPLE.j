// === USER-SERVICE ===
// user-service/src/main/java/com/example/userservice/model/User.java
package com.example.userservice.model;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles = new HashSet<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}

// user-service/src/main/java/com/example/userservice/repository/UserRepository.java
package com.example.userservice.repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}

// user-service/src/main/java/com/example/userservice/dto/UserResponseDTO.java
package com.example.userservice.dto;

@Data
@Builder
public class UserResponseDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;
    private LocalDateTime createdAt;

    public static UserResponseDTO fromUser(User user) {
        return UserResponseDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .roles(user.getRoles())
            .createdAt(user.getCreatedAt())
            .build();
    }
}

// user-service/src/main/java/com/example/userservice/dto/CreateUserRequestDTO.java
package com.example.userservice.dto;

@Data
public class CreateUserRequestDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}

// user-service/src/main/java/com/example/userservice/service/UserService.java
package com.example.userservice.service;

@Service
@Transactional
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final KafkaTemplate<String, UserEvent> kafkaTemplate;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            KafkaTemplate<String, UserEvent> kafkaTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.kafkaTemplate = kafkaTemplate;
    }

    public UserResponseDTO createUser(CreateUserRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of("ROLE_USER"))
                .build();

        User savedUser = userRepository.save(user);
        kafkaTemplate.send("user-events", new UserCreatedEvent(savedUser.getId()));
        
        return UserResponseDTO.fromUser(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserResponseDTO.fromUser(user);
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserResponseDTO::fromUser);
    }

    public UserResponseDTO updateUser(Long id, UpdateUserRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        User updatedUser = userRepository.save(user);
        kafkaTemplate.send("user-events", new UserUpdatedEvent(updatedUser.getId()));
        
        return UserResponseDTO.fromUser(updatedUser);
    }
}

// user-service/src/main/java/com/example/userservice/controller/UserController.java
package com.example.userservice.controller;

@RestController
@RequestMapping("/api/v1/users")
@Validated
@Slf4j
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDTO createUser(@Valid @RequestBody CreateUserRequestDTO request) {
        return userService.createUser(request);
    }

    @GetMapping("/{id}")
    public UserResponseDTO getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping
    public Page<UserResponseDTO> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        return userService.getAllUsers(PageRequest.of(page, size, Sort.by(sortBy)));
    }

    @PutMapping("/{id}")
    public UserResponseDTO updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequestDTO request) {
        return userService.updateUser(id, request);
    }
}

// === ORDER-SERVICE ===
// order-service/src/main/java/com/example/orderservice/model/Order.java
package com.example.orderservice.model;

@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}

// order-service/src/main/java/com/example/orderservice/model/OrderItem.java
package com.example.orderservice.model;

@Entity
@Table(name = "order_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer quantity;
}

// order-service/src/main/java/com/example/orderservice/repository/OrderRepository.java
package com.example.orderservice.repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserId(Long userId, Pageable pageable);
    List<Order> findByUserIdAndStatusIn(Long userId, List<OrderStatus> statuses);
}

// order-service/src/main/java/com/example/orderservice/dto/CreateOrderRequestDTO.java
package com.example.orderservice.dto;

@Data
public class CreateOrderRequestDTO {
    @NotEmpty(message = "Order items are required")
    private List<OrderItemRequestDTO> items;
}

@Data
public class OrderItemRequestDTO {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}

// order-service/src/main/java/com/example/orderservice/service/OrderService.java
package com.example.orderservice.service;

@Service
@Transactional
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductServiceClient productServiceClient;
    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    public OrderService(
            OrderRepository orderRepository,
            ProductServiceClient productServiceClient,
            KafkaTemplate<String, OrderEvent> kafkaTemplate) {
        this.orderRepository = orderRepository;
        this.productServiceClient = productServiceClient;
        this.kafkaTemplate = kafkaTemplate;
    }

    public OrderResponseDTO createOrder(Long userId, CreateOrderRequestDTO request) {
        // Validare produse și calcul total
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequestDTO itemRequest : request.getItems()) {
            ProductDTO product = productServiceClient.getProduct(itemRequest.getProductId());
            
            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .price(product.getPrice())
                    .quantity(itemRequest.getQuantity())
                    .build();

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(
                product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
            );
        }

        Order order = Order.builder()
                .userId(userId)
                .status(OrderStatus.CREATED)
                .items(orderItems)
                .totalAmount(totalAmount)
                .build();

        orderItems.forEach(item -> item.setOrder(order));
        Order savedOrder = orderRepository.save(order);
        
        kafkaTemplate.send("order-events", new OrderCreatedEvent(savedOrder.getId()));

        return OrderResponseDTO.fromOrder(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long id, Long userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (!order.getUserId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to access this order");
        }

        return OrderResponseDTO.fromOrder(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponseDTO> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(OrderResponseDTO::fromOrder);
    }

    public OrderResponseDTO updateOrderStatus(Long id, Long userId, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (!order.getUserId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to modify this order");
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        
        kafkaTemplate.send("order-events", new OrderStatusUpdatedEvent(updatedOrder.getId(), newStatus));

        return OrderResponseDTO.fromOrder(updatedOrder);
    }
}

// order-service/src/main/java/com/example/orderservice/controller/OrderController.java
package com.example.orderservice.controller;

@RestController
@RequestMapping("/api/v1/orders")
@Validated
@Slf4j
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponseDTO createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateOrderRequestDTO request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        return orderService.createOrder(userId, request);
    }

    @GetMapping("/{id}")
    public OrderResponseDTO getOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = Long.parseLong(userDetails.getUsername());
        return orderService.getOrderById(id, userId);
    }

    @GetMapping
    public Page<OrderResponseDTO> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        Long userId = Long.parseLong(userDetails.getUsername());
        return orderService.getUserOrders(userId, PageRequest.of(page, size, Sort.by(sortBy).descending()));
    }

    @PatchMapping("/{id}/status")
    public OrderResponseDTO updateOrderStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        Long userId = Long.parseLong(userDetails.getUsername());
        return orderService.updateOrderStatus(id, userId, request.getStatus());
    }
}