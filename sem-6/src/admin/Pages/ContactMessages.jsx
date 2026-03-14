import { useEffect, useState } from "react";
import { getContactMessages, updateContactMessageStatus } from "../data/contactStore";

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const items = await getContactMessages();
        setMessages(items);
      } catch (err) {
        setError(err?.message || "Could not load contact messages.");
      }
    })();
  }, []);

  const onToggleStatus = async (item) => {
    if (String(item.status || "").toLowerCase() === "resolved") {
      return;
    }
    const nextStatus = String(item.status || "").toLowerCase() === "resolved" ? "new" : "resolved";
    try {
      const updated = await updateContactMessageStatus(item.id, nextStatus);
      if (updated) {
        setMessages((prev) => prev.map((message) => (message.id === item.id ? updated : message)));
      }
      setError("");
      setSuccess(`Message #${item.id} marked as ${nextStatus}.`);
      setTimeout(() => setSuccess(""), 1500);
    } catch (updateError) {
      setSuccess("");
      setError(updateError?.message || "Could not update message status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-red-700 to-red-500 p-6 text-white shadow">
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <p className="mt-2 text-sm text-red-100">View and manage customer messages from the Contact Us page.</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full min-w-[1080px]">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-gray-500" colSpan={9}>
                  No contact messages found.
                </td>
              </tr>
            ) : (
              messages.map((item) => (
                <tr className="border-t align-top transition hover:bg-gray-50" key={item.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">#{item.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-700">
                        {String(item.name || "?")
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase() || "")
                          .join("") || "U"}
                      </div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{item.phone || "-"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.subject}</td>
                  <td className="max-w-sm px-4 py-3 whitespace-pre-wrap text-sm text-gray-700">{item.message}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        String(item.status || "").toLowerCase() === "resolved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.status || "new"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {String(item.status || "").toLowerCase() === "resolved" ? (
                      <button
                        className="cursor-not-allowed rounded-lg bg-gray-400 px-3 py-1.5 text-xs font-semibold text-white"
                        disabled
                        type="button"
                      >
                        Locked
                      </button>
                    ) : (
                    <button
                      className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                      onClick={() => onToggleStatus(item)}
                      type="button"
                    >
                      Resolve
                    </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactMessages;
