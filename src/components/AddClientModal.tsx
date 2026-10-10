"use client";

import { useState } from "react";
import Modal from "./Modal";
import ClientForm from "./ClientForm";

export default function AddClientModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
      >
        + Add client
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a client"
        subtitle="A client is anyone you do work for."
      >
        <ClientForm bare onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
