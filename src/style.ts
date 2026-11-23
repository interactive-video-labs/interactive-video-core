/**
 * Fallback CSS for the IVL Player
 * This CSS provides basic styling for the IVL Player components
 * and ensures readability in case the main styles fail to load.
 * It includes styles for the player container, video element, and controls.
 */

export const FALLBACK_CSS = `
.ivl-player-container {  
    font-family: Arial, sans-serif;  
    line-height: 1.6;  
    color: #333;  
}  
.ivl-player-container h1, 
.ivl-player-container h2, 
.ivl-player-container h3, 
.ivl-player-container h4, 
.ivl-player-container h5, 
.ivl-player-container h6 {  
    color: #000;  
    margin-top: 1em;  
    margin-bottom: 0.5em;  
}  


        .ivl-player-container {
            position: relative;
            max-width: 800px;
            width: 100%;
            border: 1px solid #ccc;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        video {
            width: 100%;
            display: block;
        }

        .ivl-interaction-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            z-index: 10;
            width: 80%;
            max-width: 400px;
        }

        .ivl-interaction-overlay h3 {
            margin-top: 0;
            color: #4CAF50;
        }

        .ivl-interaction-overlay button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            margin-top: 15px;
            cursor: pointer;
            border-radius: 5px;
        }

        .ivl-interaction-overlay button:hover {
            background-color: #45a049;
        }

        .controls {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }

        .ivl-debugger-toggle,
        .ivl-debugger-panel button {
            padding: 6px 10px;
            font-size: 13px;
        }

        .ivl-debugger-toggle {
            position: absolute;
            z-index: 21;
            top: 8px;
            right: 8px;
        }

        .ivl-debugger-panel {
            position: absolute;
            z-index: 20;
            right: 8px;
            bottom: 8px;
            width: min(360px, calc(100% - 16px));
            max-height: 65%;
            overflow: auto;
            box-sizing: border-box;
            padding: 12px;
            color: #f5f5f5;
            background: rgba(18, 24, 32, 0.94);
            border: 1px solid #687386;
            border-radius: 6px;
            font: 12px/1.4 Arial, sans-serif;
        }

        .ivl-debugger-panel h2,
        .ivl-debugger-panel h3 {
            margin: 0 0 8px;
            color: #fff;
            font-size: 14px;
        }

        .ivl-debugger-status {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 10px;
        }

        .ivl-debugger-track {
            position: relative;
            height: 8px;
            margin: 10px 0 14px;
            background: #576273;
            border-radius: 4px;
        }

        .ivl-debugger-progress {
            height: 100%;
            background: #5da9ff;
            border-radius: inherit;
        }

        .ivl-debugger-markers {
            position: absolute;
            inset: 0;
        }

        .ivl-debugger-marker {
            position: absolute;
            top: -3px;
            width: 7px;
            height: 14px;
            transform: translateX(-50%);
            border: 1px solid #fff;
            border-radius: 2px;
        }

        .ivl-debugger-marker-cue {
            background: #ffca55;
        }

        .ivl-debugger-marker-interaction {
            background: #ff6b6b;
        }

        .ivl-debugger-upcoming,
        .ivl-debugger-events {
            max-height: 96px;
            margin: 0 0 10px;
            padding-left: 20px;
            overflow: auto;
        }

        .ivl-debugger-events li {
            overflow-wrap: anywhere;
        }

        button,
        select {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
        }
`;
