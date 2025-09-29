import React, { useState, useMemo, useCallback } from 'react';
import { create } from 'zustand';
import { produce } from 'immer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HexColorPicker } from 'react-colorful';
import { Toaster, toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Layers,
  Settings2,
  Code,
  Box,
} from 'lucide-react';
// --- TYPES ---
interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
  visible: boolean;
}
type ShadowState = {
  layers: ShadowLayer[];
  activeLayerId: string | null;
};
type ShadowActions = {
  addLayer: () => void;
  removeLayer: (id: string) => void;
  updateLayer: <K extends keyof ShadowLayer>(id: string, key: K, value: ShadowLayer[K]) => void;
  setActiveLayerId: (id: string | null) => void;
  reorderLayers: (oldIndex: number, newIndex: number) => void;
  toggleLayerVisibility: (id: string) => void;
  loadPreset: (layers: Omit<ShadowLayer, 'id'>[]) => void;
};
// --- PRESETS ---
const presets = {
  "default": [
    { x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0, 0, 0, 0.1)', inset: false, visible: true },
    { x: 0, y: 4, blur: 6, spread: -2, color: 'rgba(0, 0, 0, 0.05)', inset: false, visible: true },
  ],
  "soft-ui": [
    { x: -6, y: -6, blur: 16, spread: 0, color: 'rgba(255, 255, 255, 0.8)', inset: false, visible: true },
    { x: 6, y: 6, blur: 16, spread: 0, color: 'rgba(21, 21, 21, 0.1)', inset: false, visible: true },
  ],
  "dramatic": [
    { x: 0, y: 50, blur: 100, spread: -20, color: 'rgba(50, 50, 93, 0.25)', inset: false, visible: true },
    { x: 0, y: 30, blur: 60, spread: -30, color: 'rgba(0, 0, 0, 0.3)', inset: false, visible: true },
  ],
  "glowing": [
    { x: 0, y: 0, blur: 20, spread: 0, color: 'rgba(59, 130, 246, 0.5)', inset: false, visible: true },
  ],
  "inset-deep": [
    { x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.2)', inset: true, visible: true },
    { x: 0, y: -1, blur: 1, spread: 0, color: 'rgba(255,255,255,0.7)', inset: true, visible: true },
  ],
};
// --- ZUSTAND STORE ---
const useShadowStore = create<ShadowState & ShadowActions>((set) => ({
  layers: presets.default.map(layer => ({ ...layer, id: `${Date.now()}-${Math.random()}` })),
  activeLayerId: null,
  addLayer: () =>
    set(
      produce((state: ShadowState) => {
        const newLayer: ShadowLayer = {
          id: `${Date.now()}-${Math.random()}`,
          x: 0,
          y: 5,
          blur: 10,
          spread: 0,
          color: 'rgba(0, 0, 0, 0.1)',
          inset: false,
          visible: true,
        };
        state.layers.push(newLayer);
        state.activeLayerId = newLayer.id;
      })
    ),
  removeLayer: (id) =>
    set(
      produce((state: ShadowState) => {
        const index = state.layers.findIndex((l) => l.id === id);
        if (index !== -1) {
          state.layers.splice(index, 1);
          if (state.activeLayerId === id) {
            state.activeLayerId = state.layers[Math.max(0, index - 1)]?.id || null;
          }
        }
      })
    ),
  updateLayer: (id, key, value) =>
    set(
      produce((state: ShadowState) => {
        const layer = state.layers.find((l) => l.id === id);
        if (layer) {
          layer[key] = value;
        }
      })
    ),
  setActiveLayerId: (id) => set({ activeLayerId: id }),
  reorderLayers: (oldIndex, newIndex) =>
    set(
      produce((state: ShadowState) => {
        state.layers = arrayMove(state.layers, oldIndex, newIndex);
      })
    ),
  toggleLayerVisibility: (id) =>
    set(
      produce((state: ShadowState) => {
        const layer = state.layers.find((l) => l.id === id);
        if (layer) {
          layer.visible = !layer.visible;
        }
      })
    ),
  loadPreset: (presetLayers) =>
    set(
      produce((state: ShadowState) => {
        state.layers = presetLayers.map(layer => ({ ...layer, id: `${Date.now()}-${Math.random()}` }));
        state.activeLayerId = state.layers[0]?.id || null;
      })
    ),
}));
// --- UTILITY FUNCTIONS ---
const generateCss = (layers: ShadowLayer[]) => {
  if (layers.length === 0) return 'box-shadow: none;';
  const shadowString = layers
    .filter((l) => l.visible)
    .map((l) => `${l.inset ? 'inset ' : ''}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`)
    .join(',\n       ');
  return `box-shadow: ${shadowString};`;
};
// --- COMPONENTS ---
const Header = () => (
  <header className="col-span-1 md:col-span-3 mb-6 flex items-center justify-between">
    <div>
      <h1 className="text-4xl font-display font-bold">Umbra</h1>
      <p className="text-muted-foreground">A minimalist CSS shadow designer</p>
    </div>
    <ThemeToggle className="relative top-0 right-0" />
  </header>
);
const SortableLayerItem = ({ layer }: { layer: ShadowLayer }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: layer.id });
  const { activeLayerId, setActiveLayerId, removeLayer, toggleLayerVisibility } = useShadowStore();
  const isActive = activeLayerId === layer.id;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center p-2 rounded-md transition-colors duration-200 cursor-pointer mb-2',
        isActive ? 'bg-blue-500/20' : 'hover:bg-accent'
      )}
      onClick={() => setActiveLayerId(layer.id)}
    >
      <div {...attributes} {...listeners} className="p-2 cursor-grab touch-none">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-grow truncate text-sm">Shadow Layer</div>
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}>
                {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Visibility</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Layer</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
const LayerManager = () => {
  const { layers, addLayer, reorderLayers, loadPreset } = useShadowStore();
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = layers.findIndex((l) => l.id === active.id);
      const newIndex = layers.findIndex((l) => l.id === over.id);
      reorderLayers(oldIndex, newIndex);
    }
  };
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Layers
        </CardTitle>
        <Select onValueChange={(value) => loadPreset(presets[value as keyof typeof presets])}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Presets" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(presets).map(key => (
              <SelectItem key={key} value={key} className="capitalize">{key}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 mb-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={layers.map(l => l.id)} strategy={verticalListSortingStrategy}>
              {layers.map((layer) => (
                <SortableLayerItem key={layer.id} layer={layer} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <Button onClick={addLayer} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Layer
        </Button>
      </CardContent>
    </Card>
  );
};
const ControlSlider = ({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const num = parseFloat(e.target.value);
          if (!isNaN(num)) {
            onValueChange(num);
          }
        }}
        className="w-20 h-8 text-center"
        min={min}
        max={max}
        step={step}
      />
    </div>
    <Slider
      value={[value]}
      onValueChange={([val]) => onValueChange(val)}
      min={min}
      max={max}
      step={step}
    />
  </div>
);
const ControlsPanel = () => {
  const { layers, activeLayerId, updateLayer } = useShadowStore();
  const activeLayer = useMemo(() => layers.find((l) => l.id === activeLayerId), [layers, activeLayerId]);
  const handleUpdate = useCallback(
    <K extends keyof ShadowLayer>(key: K, value: ShadowLayer[K]) => {
      if (activeLayerId) {
        updateLayer(activeLayerId, key, value);
      }
    },
    [activeLayerId, updateLayer]
  );
  if (!activeLayer) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Select a layer to edit</p>
          <p className="text-xs">or add a new one</p>
        </div>
      </Card>
    );
  }
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Properties
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <ControlSlider label="X Offset" value={activeLayer.x} onValueChange={(v) => handleUpdate('x', v)} min={-100} max={100} step={1} />
        <ControlSlider label="Y Offset" value={activeLayer.y} onValueChange={(v) => handleUpdate('y', v)} min={-100} max={100} step={1} />
        <ControlSlider label="Blur" value={activeLayer.blur} onValueChange={(v) => handleUpdate('blur', v)} min={0} max={200} step={1} />
        <ControlSlider label="Spread" value={activeLayer.spread} onValueChange={(v) => handleUpdate('spread', v)} min={-100} max={100} step={1} />
        <div className="flex items-center justify-between">
          <Label htmlFor="inset-switch" className="text-sm font-medium">Inset</Label>
          <Switch id="inset-switch" checked={activeLayer.inset} onCheckedChange={(v) => handleUpdate('inset', v)} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Color</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <div className="w-4 h-4 rounded-sm mr-2 border" style={{ backgroundColor: activeLayer.color }} />
                <span>{activeLayer.color}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0">
              <HexColorPicker color={activeLayer.color} onChange={(v) => handleUpdate('color', v)} />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};
const PreviewCanvas = () => {
  const layers = useShadowStore((state) => state.layers);
  const shadowStyle = useMemo(() => {
    const css = generateCss(layers);
    const value = css.includes('none') ? 'none' : css.replace('box-shadow: ', '').replace(';', '');
    return { boxShadow: value };
  }, [layers]);
  return (
    <div className="h-full flex items-center justify-center p-6 bg-muted rounded-lg relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />
      <motion.div
        layout
        className="w-48 h-48 bg-card rounded-2xl transition-all duration-200 ease-in-out"
        style={shadowStyle}
      />
    </div>
  );
};
const CodeOutput = () => {
  const layers = useShadowStore((state) => state.layers);
  const cssString = useMemo(() => generateCss(layers), [layers]);
  const handleCopy = () => {
    navigator.clipboard.writeText(cssString);
    toast.success('CSS copied to clipboard!');
  };
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Code className="h-5 w-5" />
          CSS Output
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
          <code>{cssString}</code>
        </pre>
      </CardContent>
    </Card>
  );
};
export function HomePage() {
  return (
    <>
      <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Header />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="md:col-span-1"
            >
              <LayerManager />
            </motion.div>
            <div className="md:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-[400px]"
              >
                <PreviewCanvas />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <CodeOutput />
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="md:col-span-1"
            >
              <ControlsPanel />
            </motion.div>
          </div>
        </div>
      </main>
      <Toaster richColors />
    </>
  );
}