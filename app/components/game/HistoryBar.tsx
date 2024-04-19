//8 emojis. Try different heights for the history bar. Code everything out. Try left to right or right to left 
//Use the history is already saved in the GameState object.
//Try and implement styling using the Tailwind classes, which is a modern branch of CSS.
//Try animations to see which looks best. Scroll in, fade in etc.
//
//Stretch goal being the hover over element name.

interface HistoryTrackerProps {
  history: string[];
}

const HistoryTracker: React.FC<HistoryTrackerProps> = ({ history }) => {
  return (
    <div>
      <div className="items-center mb-2">
        <h3 className="mb-1">History</h3>
        <div className="border-b border-gray-400"></div>
      </div>
      <div className="flex items-center mb-4">
        <div className="flex">
          {history.map((item, index) => (
            <span key={index} className="emoji mr-1">
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-center">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="w-4 h-4 bg-gray-300 rounded-sm mx-1"></div>
        ))}
      </div>
    </div>
  );
};
  
  export default HistoryTracker;