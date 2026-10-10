"use client";

import { useState } from "react";
import Modal from "./Modal";
import UserForm from "./UserForm";

export default function AddMemberModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
      >
        + Add team member
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a team member"
        subtitle="They can log in with this email and password."
      >
        <UserForm bare onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
