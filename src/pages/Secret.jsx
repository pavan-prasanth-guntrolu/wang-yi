import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const Secret = () => {
  const [enteredPassword, setEnteredPassword] = useState("");
  const [counts, setCounts] = useState({ total: 0, inPerson: 0, virtual: 0, unspecified: 0 });
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (enteredPassword === "admin@qiskit") {
      setAuthenticated(true);
      fetchCounts();
    } else {
      alert("Incorrect password");
    }
  };

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const { data, count, error } = await supabase
        .from("registrations")
        .select("attendance_mode", { count: "exact" });

      if (error) throw error;

      // Normalize and count
      let inPerson = 0;
      let virtual = 0;
      let unspecified = 0;

      data.forEach((row) => {
        const mode = row.attendance_mode?.toLowerCase().trim();
        if (mode === "in-person") inPerson++;
        else if (mode === "virtual") virtual++;
        else unspecified++;
      });

      setCounts({
        total: count ?? 0,
        inPerson,
        virtual,
        unspecified,
      });
    } catch (error) {
      console.error("Error fetching registration stats:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Secret Admin Page</h1>
          <p className="mb-4">Enter the password to access:</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600"
              placeholder="Password"
            />
            <br />
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Secret Admin Page</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-3 text-2xl">
            <p>
              🧾 Total Registrations: <strong>{counts.total}</strong>
            </p>
            <p>
              🏛️ In-Person Attendees: <strong>{counts.inPerson}</strong>
            </p>
            <p>
              💻 Virtual Attendees: <strong>{counts.virtual}</strong>
            </p>
            <p>
              ❔ Not Specified: <strong>{counts.unspecified}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Secret;
