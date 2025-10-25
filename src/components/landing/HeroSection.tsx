import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex flex-col justify-end items-center px-6 py-20 pb-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-left space-y-8 relative z-10"
      >
        <div className="space-y-4">
          <h1 className="text-7xl font-bold tracking-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Doc</span>
          </h1>
          <h2 className="text-5xl font-bold">
            Bureaucracy, meet agentic AI.
          </h2>
        </div>

        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Your personal document assistant that explains complex paperwork, fills forms, tracks
          deadlines, and navigates bureaucracy so you don't have to.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Button
            variant="hero"
            size="lg"
            className="text-lg px-8 py-6 h-auto"
            onClick={() => navigate("/signin")}
          >
            Try Doc
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};
