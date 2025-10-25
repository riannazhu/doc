export const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          Developed by students at UC Berkeley
        </p>
        <div className="mt-4 flex justify-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};
