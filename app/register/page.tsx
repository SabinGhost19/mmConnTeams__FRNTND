import React from "react";

const registerPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Creează un cont nou
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sau{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            autentifică-te dacă ai deja un cont
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Indicator de progres */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= stepNumber
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {stepNumber === 1
                      ? "Cont"
                      : stepNumber === 2
                      ? "Profil"
                      : "Finalizare"}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 h-1 w-full bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Pasul 1: Informații de bază */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Prenume
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nume
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Adresă de email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Parolă
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirmă parola
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Rol
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={ROLE.STUDENT}>Student</option>
                    <option value={ROLE.TEACHER}>Profesor</option>
                  </select>
                </div>
              </div>
            )}

            {/* Pasul 2: Informații academice și profil */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="institution"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Instituție de învățământ
                  </label>
                  <input
                    id="institution"
                    name="institution"
                    type="text"
                    value={formData.institution}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.institution && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.institution}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="studyLevel"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nivel de studii
                    </label>
                    <select
                      id="studyLevel"
                      name="studyLevel"
                      value={formData.studyLevel || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selectează</option>
                      <option value="Liceu">Liceu</option>
                      <option value="Licență">Licență</option>
                      <option value="Master">Master</option>
                      <option value="Doctorat">Doctorat</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="specialization"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Specializare
                    </label>
                    <input
                      id="specialization"
                      name="specialization"
                      type="text"
                      value={formData.specialization || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="year"
                      className="block text-sm font-medium text-gray-700"
                    >
                      An de studiu
                    </label>
                    <input
                      id="year"
                      name="year"
                      type="number"
                      min="1"
                      max="6"
                      value={formData.year || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="group"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Grupă/Clasă
                    </label>
                    <input
                      id="group"
                      name="group"
                      type="text"
                      value={formData.group || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Număr de telefon
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Descriere scurtă
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Spune-ne câteva cuvinte despre tine..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fotografie de profil
                  </label>
                  <div className="mt-2 flex items-center">
                    {imagePreview ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          layout="fill"
                          objectFit="cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({
                              ...formData,
                              profileImage: undefined,
                            });
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                      </div>
                    )}
                    <label
                      htmlFor="profileImage"
                      className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Încarcă
                    </label>
                    <input
                      id="profileImage"
                      name="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pasul 3: Preferințe și termeni */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Preferințe de notificare
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Alege cum dorești să primești notificări.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notificationPreferences.email"
                          name="notificationPreferences.email"
                          type="checkbox"
                          checked={formData.notificationPreferences?.email}
                          onChange={handleChange}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="notificationPreferences.email"
                          className="font-medium text-gray-700"
                        >
                          Email
                        </label>
                        <p className="text-gray-500">
                          Primește notificări prin email.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notificationPreferences.push"
                          name="notificationPreferences.push"
                          type="checkbox"
                          checked={formData.notificationPreferences?.push}
                          onChange={handleChange}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="notificationPreferences.push"
                          className="font-medium text-gray-700"
                        >
                          Notificări push
                        </label>
                        <p className="text-gray-500">
                          Primește notificări push pe dispozitivul tău.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notificationPreferences.desktop"
                          name="notificationPreferences.desktop"
                          type="checkbox"
                          checked={formData.notificationPreferences?.desktop}
                          onChange={handleChange}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="notificationPreferences.desktop"
                          className="font-medium text-gray-700"
                        >
                          Notificări desktop
                        </label>
                        <p className="text-gray-500">
                          Primește notificări pe desktop.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="termsAccepted"
                        name="termsAccepted"
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="termsAccepted"
                        className="font-medium text-gray-700"
                      >
                        Accept termenii și condițiile
                      </label>
                      <p className="text-gray-500">
                        Am citit și sunt de acord cu{" "}
                        <a
                          href="#"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          Termenii și condițiile
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                  {errors.termsAccepted && (
                    <p className="text-xs text-red-600">
                      {errors.termsAccepted}
                    </p>
                  )}

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="privacyPolicyAccepted"
                        name="privacyPolicyAccepted"
                        type="checkbox"
                        checked={formData.privacyPolicyAccepted}
                        onChange={handleChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="privacyPolicyAccepted"
                        className="font-medium text-gray-700"
                      >
                        Accept politica de confidențialitate
                      </label>
                      <p className="text-gray-500">
                        Am citit și sunt de acord cu{" "}
                        <a
                          href="#"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          Politica de confidențialitate
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                  {errors.privacyPolicyAccepted && (
                    <p className="text-xs text-red-600">
                      {errors.privacyPolicyAccepted}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Butoane de navigare */}
            <div className="mt-6 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Înapoi
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className={`${
                    step > 1 ? "ml-3" : ""
                  } inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  Continuă
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {registerMutation.isPending
                    ? "Se procesează..."
                    : "Creează cont"}
                </button>
              )}
            </div>
          </form>

          {/* Erori de la server */}
          {registerMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
              <p className="font-medium">Eroare</p>
              <p className="text-sm">{registerMutation.error.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default registerPage;
