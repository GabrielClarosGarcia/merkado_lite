"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./EditarUsuarioForm.module.css";

import { getUserById, updateUser } from "@/services/userService";
import { getAllRoles } from "@/services/roleService";
import type { User } from "@/app/models/User";

interface PageProps {
  params: {
    userId: string;
  };
}

interface Role {
  id_role: number;
  name: string;
  description?: string;
}

export default function Page({ params }: PageProps) {
  const userId = Number(params.userId);
  const router = useRouter();

  const [formData, setFormData] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const redirectPath = "/administrador/usuarios/lista";

  const ALL_PERMISSIONS = [
    { id: "gestion_usuarios", name: "Gestionar Usuarios" },
    { id: "ver_reportes", name: "Ver Reportes" },
    { id: "gestion_stock", name: "Gestionar Stock" },
  ];

  if (isNaN(userId)) {
    return <div className="text-red-500 p-4">ID de usuario inválido</div>;
  }

  // Cargar usuario
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getUserById(userId);
        setFormData(data);
        setPermissions(data.permisosEspecificos || []);
      } catch (error: any) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId]);

  // Cargar roles
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await getAllRoles();
        setRoles(rolesData);
      } catch (error: any) {
        console.error("Error cargando roles:", error.message);
      }
    };
    loadRoles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;

    // Si el cambio es de rol, asignamos objeto completo
    if (name === "role") {
      const selectedRole = roles.find(r => r.id_role === Number(value));
      setFormData({ ...formData as any, role: selectedRole });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const togglePermission = (perm: string) => {
    setPermissions(prev => (prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateUser(userId, { ...formData as any, permisosEspecificos: permissions });
      setMessage("Usuario actualizado correctamente.");
      router.push(redirectPath);
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.container}>Cargando usuario...</div>;
  if (!formData) return <div className={styles.container}>No se pudo cargar el usuario.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Editar Usuario</h1>

        {message && <div className={styles.alert}>{message}</div>}

        <form onSubmit={handleSubmit}>
          {/* INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className={styles.inputContainer}>
              <label className={styles.label}>Nombre Completo</label>
              <input
                className={styles.input}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.inputContainer}>
              <label className={styles.label}>CI</label>
              <input
                className={styles.input}
                name="ci"
                value={formData.ci}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.inputContainer}>
              <label className={styles.label}>Teléfono</label>
              <input
                className={styles.input}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.inputContainer}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            
          </div>

          {/* SELECTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className={styles.selectContainer}>
              <label className={styles.label}>Rol</label>
              <select
                name="role"
                value={formData.role || ""}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="" disabled>Seleccione un rol</option>
                {roles.map(role => (
                  <option key={role.id_role} value={role.id_role}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.selectContainer}>
              <label className={styles.label}>Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>
          </div>

          {/* PERMISOS */}
          <div className={styles.permissionBox}>
            <h2 className="text-xl text-gray-200 font-bold mb-3">Permisos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_PERMISSIONS.map(perm => (
                <label key={perm.id} className={styles.permissionCard}>
                  <input
                    type="checkbox"
                    checked={permissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                  />
                  <span className="ml-3 text-gray-200">{perm.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* BUTTONS */}
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => router.push(redirectPath)}
            >
              Cancelar
            </button>
            <button type="submit" disabled={saving} className={styles.btnSave}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
