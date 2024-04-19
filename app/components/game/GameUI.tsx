"use client";

import { useEffect, useState } from "react";
import { queryValue, queryOptions } from "./QueryData";
import OptionList from "./OptionList/OptionList";
import CATEGORIES from "./Categories";
import HistoryTracker from './HistoryBar';

interface CurrentCategory {
  title: string;
  breakpoint: number;
}

interface GameUIProps {
  initItem: string;
  initCategory: CurrentCategory;
  initOptions: string[];
}

export type GameState = {
  currentItem: string;
  currentCategory: CurrentCategory;
  options: string[];
  loopCount: number;
  history: string[];
}

const GameUI: React.FC<GameUIProps> = ({
  initItem,
  initCategory,
  initOptions,
}) => {
  const loadSaveState = (): GameState => {
    let state = initState;
    const storedStateStr = localStorage.getItem("gameState");
    if (storedStateStr) {
      try {
        const storedState = JSON.parse(storedStateStr);
        state = storedState;
      } catch (error) {
        console.error(error);
      }
    }
    return state;
  };

  const setGameState = (newState: GameState) => {
    localStorage.setItem("gameState", JSON.stringify(newState));
    setActiveGameState(newState);
  };

  const updateCategory = async (newItem: string) => {
    let newValue: number = 0;
    try {
      const boundEstimates = await queryValue(newItem);
      newValue =
        Math.floor(
          Math.random() *
            (boundEstimates.upperBound - boundEstimates.lowerBound + 1)
        ) + boundEstimates.lowerBound; // Random value within the estimated bounds
    } catch (error) {
      console.error(error);
      return gameState.currentCategory;
    }

    const currentCatIndex = Math.max(
      0,
      CATEGORIES.findIndex(
        (cat) => gameState.currentCategory.breakpoint <= cat.breakpoint
      )
    );
    const bestCat =
      CATEGORIES.slice(currentCatIndex - 1, CATEGORIES.length).find(
        (cat) => newValue < cat.breakpoint
      ) || CATEGORIES[CATEGORIES.length - 1];

    const randomIndex = Math.floor(Math.random() * bestCat.titles.length);
    return {
      title: bestCat.titles[randomIndex],
      breakpoint: bestCat.breakpoint,
    };
  };

  const handleButtonClick = async (buttonText: string) => {
    setIsLoading(true);
    const selectedItem = buttonText;
    const oldItem = gameState.currentItem;
    setGameState({ ...gameState, currentItem: selectedItem });

    const updatedCategory =
      gameState.loopCount % 2 == 1
        ? await updateCategory(selectedItem)
        : gameState.currentCategory;

    try {
      const newItems: string[] = await queryOptions(
        selectedItem,
        updatedCategory.title
      );
      setGameState({
        currentItem: selectedItem,
        currentCategory: updatedCategory,
        options: newItems,
        loopCount: gameState.loopCount + 1,
        history: [...gameState.history, selectedItem],
      });
    } catch (error) {
      console.error(error);
      setGameState({ ...gameState, currentItem: oldItem });
    }
    setIsLoading(false);
  };

  const initState: GameState = {
    currentItem: initItem,
    currentCategory: initCategory,
    options: initOptions,
    loopCount: 0,
    history: [initItem],
  };
  
  const [isClient, setIsClient] = useState(false);
  const [gameState, setActiveGameState] = useState<GameState>(initState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setActiveGameState(loadSaveState());
  }, []);

  if (isClient) {
    document.title = gameState.currentItem;
  }

  const dialogue = [
    `You have ${gameState.currentItem}. `,
    `Select an item to trade for:`,
  ];
  const getHistory = () => gameState.history;

  return (
    <div className="flex flex-col pt-24 px-12 min-h-screen items-center justify-between font-mono text-sm text-slate-900">
      <div className="z-10 max-w-lg ">
        <p className="static w-auto my-10 p-4 border-b border-gray-400">
          {dialogue.map((txt, i) => (
            <span key={i}>
              {txt} <br />
            </span>
          ))}
        </p>
        {isLoading ? (
          <OptionList
            items={gameState.options.map(() => "...")}
            handleButtonClick={() => {}}
          />
        ) : (
          <OptionList
            items={gameState.options}
            handleButtonClick={handleButtonClick}
          />
        )}
      </div>
      <button
        className="border-t border-l border-gray-400 py-1 px-2 bg-transparent absolute bottom-0 right-0"
        onClick={() => setGameState(initState)}
      >
        Reset
      </button>
      <HistoryTracker history={gameState.history} />
    </div>
  );
};

export default GameUI;