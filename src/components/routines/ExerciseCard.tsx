import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

interface ExerciseCardProps {
  name: string;
  equipment?: string;
  sets: number;
  reps: string;
  rir?: string;
  imageUrl?: string;
  notes?: string;
}

export function ExerciseCard({ 
  name, 
  equipment, 
  sets, 
  reps, 
  rir, 
  imageUrl, 
  notes 
}: ExerciseCardProps) {
  // Default placeholder image for exercises
  const defaultImage = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop";

  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-all duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Exercise Image */}
        <div className="relative w-full md:w-40 h-32 md:h-auto">
          <img
            src={imageUrl || defaultImage}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent md:bg-gradient-to-r" />
        </div>

        {/* Exercise Details */}
        <CardContent className="flex-1 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h4 className="font-medium text-lg flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                {name}
              </h4>
              {equipment && (
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                  equipment.toLowerCase().includes("mancuerna")
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-primary/20 text-primary"
                }`}>
                  {equipment}
                </span>
              )}
              {notes && (
                <p className="text-sm text-muted-foreground mt-2">{notes}</p>
              )}
            </div>

            {/* Sets/Reps/RIR */}
            <div className="flex gap-4 md:gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{sets}</p>
                <p className="text-xs text-muted-foreground">Series</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{reps}</p>
                <p className="text-xs text-muted-foreground">Reps</p>
              </div>
              {rir && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{rir}</p>
                  <p className="text-xs text-muted-foreground">RIR</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}