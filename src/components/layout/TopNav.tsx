import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function TopNav() {
  const navigate = useNavigate();
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm ${isActive ? "text-primary" : "text-foreground/80 hover:text-foreground"}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="container mx-auto px-4 md:px-6 xl:px-10 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-lg">
          <img 
            src="/lovable-uploads/048c2a9e-abc8-4951-8a52-70b7d76192f3.png" 
            alt="Padu" 
            className="w-8 h-8 rounded-lg"
          />
          <span>Padu</span>
        </Link>

        {/* Desktop actions */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/#pricing" className={linkCls}>Pricing</NavLink>
          <NavLink to="/#docs" className={linkCls}>Docs</NavLink>
          <Button
            variant="hero"
            onClick={() => document.dispatchEvent(new CustomEvent("waitlist:open"))}
            className="ml-1"
          >
            Join Waitlist
          </Button>
        </nav>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-2">
                <NavLink to="/#pricing" className={linkCls}>Pricing</NavLink>
                <NavLink to="/#docs" className={linkCls}>Docs</NavLink>
                <Button variant="hero" onClick={() => document.dispatchEvent(new CustomEvent("waitlist:open"))}>Join Waitlist</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
