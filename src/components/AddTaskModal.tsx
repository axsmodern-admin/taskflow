"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import NewTaskForm from "@/components/NewTaskForm";

export default function AddTaskModal({
  clients,
  users,
  defaultClientId,
}: {
  clients: { id: string; name: string }[];
  users: { id: string; name: string }[];
  defaultClientId?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        + New task
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New task"
        subtitle="Give it a clear title, pick the client, and assign whoever should do it."
      >
        <NewTaskForm clients={clients} users={users} bare onDone={() => setOpen(false)} defaultClientId={defaultClientId} />
      </Modal>
    </>
  );
}
