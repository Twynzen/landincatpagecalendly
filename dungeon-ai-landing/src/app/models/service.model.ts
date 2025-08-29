export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
}

export interface ConsultationProcess {
  discovery: ProcessStep;
  pilot: ProcessStep;
  scale: ProcessStep;
}

export interface ProcessStep {
  duration: string;
  description: string;
  deliverable: string;
}

export interface GameState {
  torchesLit: Set<string>;
  catAwake: boolean;
  catFed: boolean;
  cursorMode: 'eye' | 'net';
  mousesCaught: number;
  servicesRevealed: Set<string>;
}

export interface Position {
  x: number;
  y: number;
}

export interface Mouse {
  id: string;
  position: Position;
  element?: HTMLElement;
}

export interface Torch {
  id: string;
  position: Position;
  isLit: boolean;
  element?: HTMLElement;
}