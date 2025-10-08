import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const Secret = () => {
  const [counts, setCounts] = useState({
    total: null,
    inPerson: null,
    virtual: null,
    unspecified: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
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

    fetchCounts();
  }, []);

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
