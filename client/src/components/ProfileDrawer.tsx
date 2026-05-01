import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, Camera, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import styles from "./ProfileDrawer.module.css";

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setEditName(user?.fullName ?? "");
    setPhotoPreview(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setPhotoPreview(null);
  };

  const handleSave = async () => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await updateUser({
        fullName: trimmed,
        photoBase64: photoPreview ?? user?.photoBase64 ?? null,
      });
    } catch {
      // silently fail for now
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const handlePhotoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  if (!user) return null;

  const initials = getInitials(user.fullName);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className={styles.drawer}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <span className={styles.headerTitle}>Profile</span>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className={styles.body}>
              {/* Avatar */}
              <div className={styles.avatar}>
                {editing && photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Avatar"
                    className={styles.avatarImg}
                  />
                ) : user.photoBase64 ? (
                  <img
                    src={user.photoBase64}
                    alt="Avatar"
                    className={styles.avatarImg}
                  />
                ) : (
                  initials
                )}
                {editing && (
                  <div
                    className={styles.avatarEditOverlay}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={24} color="#fff" />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />

              {/* Name */}
              {editing ? (
                <input
                  className={styles.editInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") handleCancel();
                  }}
                />
              ) : (
                <span className={styles.userName}>{user.fullName}</span>
              )}

              {/* Email (always read-only) */}
              <span className={styles.userEmail}>{user.email}</span>

              {/* Actions */}
              <div className={styles.actions}>
                {editing ? (
                  <>
                    <button
                      className={styles.btnPrimary}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <Check size={14} />
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      className={styles.btnOutline}
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className={styles.btnPrimary} onClick={handleEdit}>
                    <Pencil size={14} />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
