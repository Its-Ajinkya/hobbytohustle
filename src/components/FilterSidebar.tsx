import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  location: string;
  category: string;
  budget: number[];
  datePosted: string;
  onLocationChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBudgetChange: (value: number[]) => void;
  onDatePostedChange: (value: string) => void;
  onReset: () => void;
}

export const FilterSidebar = ({
  location,
  category,
  budget,
  datePosted,
  onLocationChange,
  onCategoryChange,
  onBudgetChange,
  onDatePostedChange,
  onReset,
}: FilterSidebarProps) => {
  return (
    <Card className="h-fit sticky top-24">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Location</Label>
          <Select value={location} onValueChange={onLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="koregaon-park">Koregaon Park</SelectItem>
              <SelectItem value="hinjewadi">Hinjewadi</SelectItem>
              <SelectItem value="viman-nagar">Viman Nagar</SelectItem>
              <SelectItem value="kothrud">Kothrud</SelectItem>
              <SelectItem value="wakad">Wakad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Category</Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="photography">Photography</SelectItem>
              <SelectItem value="baking">Baking</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="fitness">Fitness</SelectItem>
              <SelectItem value="crafts">Crafts</SelectItem>
              <SelectItem value="content">Content Creation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Budget Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Budget Range (₹{budget[0].toLocaleString()} - ₹{budget[1].toLocaleString()})
          </Label>
          <Slider
            min={0}
            max={50000}
            step={1000}
            value={budget}
            onValueChange={onBudgetChange}
            className="w-full"
          />
        </div>

        {/* Date Posted Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date Posted</Label>
          <Select value={datePosted} onValueChange={onDatePostedChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
