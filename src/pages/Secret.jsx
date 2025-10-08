import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

const SECRET_EMOJI = ["🔐", "🧬", "🪐", "🧪", "🧠", "🔮", "🧑‍🚀", "🧲"];

const Secret = () => {
  const navigate = useNavigate();
  const { user, isAdmin, adminLoading } = useAuth();

  useEffect(() => {
    if (!adminLoading) {
      if (!user) {
        navigate("/login", { replace: true, state: { from: "/secret" } });
      } else if (!isAdmin) {
        navigate("/", { replace: true });
      }
    }
  }, [adminLoading, isAdmin, navigate, user]);

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

    if (user && isAdmin) {
      fetchCounts();
    }
  }, [isAdmin, user]);

  if (adminLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking access...</p>
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
