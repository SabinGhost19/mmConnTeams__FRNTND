"use client";
import { useEffect, useState } from "react";
import AdminLandingPage from "../services/admin/AdminLandingPage";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { ROLE } from "../types/models_types/roles";

const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await api.get("/api/users/current");
        const userData = response.data;

        console.log("Admin Data", userData);

        if (
          userData &&
          userData.roles &&
          userData.roles.includes(ROLE.STUDENT)
        ) {
          setIsAdmin(true);
        } else {
          // Not an admin, redirect to home
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        // Error occurred, redirect to login
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Redirect in progress
  }

  return <AdminLandingPage />;
};

export default AdminPage;
