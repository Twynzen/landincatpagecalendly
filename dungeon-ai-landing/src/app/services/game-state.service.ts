import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState } from '../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private gameStateSubject = new BehaviorSubject<GameState>({
    torchesLit: new Set<string>(),
    catAwake: false,
    catFed: false,
    cursorMode: 'eye',
    mousesCaught: 0,
    servicesRevealed: new Set<string>()
  });

  public gameState$: Observable<GameState> = this.gameStateSubject.asObservable();

  constructor() { }

  getGameState(): GameState {
    return this.gameStateSubject.value;
  }

  lightTorch(torchId: string): void {
    const state = this.getGameState();
    state.torchesLit.add(torchId);
    this.gameStateSubject.next(state);
  }

  extinguishTorch(torchId: string): void {
    const state = this.getGameState();
    state.torchesLit.delete(torchId);
    this.gameStateSubject.next(state);
  }

  wakeCat(): void {
    const state = this.getGameState();
    state.catAwake = true;
    this.gameStateSubject.next(state);
  }

  feedCat(): void {
    const state = this.getGameState();
    state.catFed = true;
    this.gameStateSubject.next(state);
  }

  setCursorMode(mode: 'eye' | 'net'): void {
    const state = this.getGameState();
    state.cursorMode = mode;
    this.gameStateSubject.next(state);
  }

  catchMouse(): void {
    const state = this.getGameState();
    state.mousesCaught++;
    this.gameStateSubject.next(state);
  }

  revealService(serviceId: string): void {
    const state = this.getGameState();
    state.servicesRevealed.add(serviceId);
    this.gameStateSubject.next(state);
  }

  isServiceRevealed(serviceId: string): boolean {
    return this.getGameState().servicesRevealed.has(serviceId);
  }

  isTorchLit(torchId: string): boolean {
    return this.getGameState().torchesLit.has(torchId);
  }
}
