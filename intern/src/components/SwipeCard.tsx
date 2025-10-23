import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Calendar, X, Heart, Building } from "lucide-react";

interface SwipeCardProps {
  internship: any;
  onSwipe: (direction: "left" | "right") => void;
}

const SwipeCard = ({ internship, onSwipe }: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const companyName = internship.company?.company_profiles?.[0]?.company_name || "Company";
  const logoUrl = internship.company?.company_profiles?.[0]?.logo_url;

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const offsetX = clientX - startPos.x;
    const offsetY = clientY - startPos.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const threshold = 100;

    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? "right" : "left");
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const rotation = (dragOffset.x / 20).toFixed(2);
  const opacity = 1 - Math.abs(dragOffset.x) / 300;

  return (
    <div className="relative w-full animate-scale-in">
      {/* Swipe hints */}
      <div
        className="absolute left-8 top-1/2 -translate-y-1/2 z-10 transition-opacity"
        style={{ opacity: dragOffset.x < -50 ? 1 : 0 }}
      >
        <div className="bg-destructive text-destructive-foreground p-4 rounded-full rotate-12 shadow-glow">
          <X className="w-8 h-8" />
        </div>
      </div>
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2 z-10 transition-opacity"
        style={{ opacity: dragOffset.x > 50 ? 1 : 0 }}
      >
        <div className="bg-gradient-primary text-primary-foreground p-4 rounded-full -rotate-12 shadow-glow">
          <Heart className="w-8 h-8" />
        </div>
      </div>

      <Card
        className="w-full h-[550px] p-6 cursor-grab active:cursor-grabbing shadow-elevated hover:shadow-glow transition-shadow bg-gradient-card overflow-hidden"
        style={{
          transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
          opacity,
          transition: isDragging ? "none" : "all 0.3s ease-out",
        }}
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleDragEnd}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Company header */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center">
                <Building className="w-6 h-6 text-secondary-foreground" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg">{companyName}</h3>
              <p className="text-sm text-muted-foreground">{internship.company?.full_name}</p>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {internship.title}
          </h2>

          {/* Quick info */}
          <div className="flex flex-wrap gap-2 mb-4">
            {internship.location && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {internship.location}
              </Badge>
            )}
            {internship.is_remote && (
              <Badge variant="secondary">Remote</Badge>
            )}
            {internship.stipend_min && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                ${internship.stipend_min}-${internship.stipend_max}/mo
              </Badge>
            )}
            {internship.duration_months && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {internship.duration_months} months
              </Badge>
            )}
          </div>

          {/* Skills */}
          {internship.skills_required && internship.skills_required.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {internship.skills_required.map((skill: string, idx: number) => (
                  <Badge key={idx} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-4 flex-1">
            <h4 className="font-semibold mb-2">About the Role</h4>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {internship.description}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mt-auto pt-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-2 hover:border-destructive hover:bg-destructive/10 transition-all"
              onClick={() => onSwipe("left")}
            >
              <X className="w-5 h-5 mr-2" />
              Skip
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-all"
              onClick={() => onSwipe("right")}
            >
              <Heart className="w-5 h-5 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SwipeCard;