import { motion } from "framer-motion";
import {
  Globe,
  Rocket,
  Users,
  Zap,
  Star,
  Cpu,
  Award,
  Lightbulb,
  Gift,
} from "lucide-react";

const About = () => {
  const objectives = [
    {
      title: "Promote Awareness of Quantum Technologies",
      desc: "Inspire curiosity and understanding of the potential and impact of Quantum Technologies (QT) among students and enthusiasts.",
      link: "https://rgukt.in",
      img: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Quantum_computing_logo.png",
    },
    {
      title: "Empower Students to Pursue Quantum Studies",
      desc: "Build confidence and foundational knowledge that motivate students to explore learning and research opportunities in QT.",
      link: "https://rgukt.in",
      icon: <Users className="w-10 h-10 text-cyan-400" />,
    },
    {
      title: "Leverage Quantum Technologies for Sustainable Development",
      desc: "Highlight and explore how quantum innovations can address global challenges and contribute to sustainable development goals.",
      link: "https://sdgs.un.org/goals",
      img: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Sustainable_Development_Goals_logo.png",
    },
    {
      title: "Foster Career Opportunities in Quantum Computing",
      desc: "Connect participants to pathways, mentors, and resources that support career advancement in the quantum domain.",
      link: "https://rgukt.in",
      icon: <Award className="w-10 h-10 text-yellow-400" />,
    },
    {
      title: "Showcase Quantum Innovation with Qiskit",
      desc: "Explore advancements, hands-on learning, and practical applications using Qiskit to strengthen technical proficiency in quantum computing.",
      link: "https://qiskit.org",
      img: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Qiskit-Logo.svg",
    },
    {
      title: "Contribute to India’s National Quantum Mission (NQM)",
      desc: "Align student innovation and community-driven learning with the goals of the NQM to support India’s growing quantum ecosystem.",
      link: "https://dst.gov.in/national-quantum-mission",
      img: "https://dst.gov.in/sites/default/files/favicon.ico",
    },
    {
      title: "Develop Local Talent for Amaravati Quantum Valley",
      desc: "Cultivate and connect emerging talent in the region to contribute to the vision of Amaravati as a hub for quantum innovation.",
      link: "https://aqv.in",
      icon: <Rocket className="w-10 h-10 text-pink-400" />,
    },
    {
      title: "Celebrate the International Year of Quantum (IYQ)",
      desc: "Join global celebrations that recognize progress, collaboration, and discovery in the field of quantum technologies.",
      link: "https://quantum2025.org",
      img: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Quantum_symbol.png",
    },
    {
      title: "✨ A Surprise Awaits!",
      desc: "Something special is coming soon — stay tuned to discover it!",
      link: "/surprise",
      icon: <Gift className="w-10 h-10 text-purple-400" />,
    },
  ];

  return (
    <motion.div
      className="max-w-6xl mx-auto px-6 py-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 text-white">
        Our Objectives
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {objectives.map((obj, index) => (
          <motion.a
            key={index}
            href={obj.link}
            target={obj.link.startsWith("http") ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className="group block bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 transition-all duration-500 hover:bg-white/10 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/40"
            whileHover={{ y: -6, scale: 1.04 }}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {obj.img ? (
                <img
                  src={obj.img}
                  alt={obj.title}
                  className="w-12 h-12 object-contain rounded-full bg-white/10 p-2 transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                obj.icon
              )}
              <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-cyan-400">
                {obj.title}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {obj.desc}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};

export default About;
