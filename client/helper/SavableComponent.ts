
/**
 * This interface is implemented by components whose state 
 * will be saved even when the app is in the background.
 */
export interface SaveableComponent {
    // These functions should call saveState() on child components.
    saveState(): void;
    loadState(): void;
    // Used in the constructor and should not call saveState() on child components.
    initialLoadState(): void;
}