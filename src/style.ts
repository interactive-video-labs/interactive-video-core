export const FALLBACK_CSS = `
/* Fallback CSS for basic readability */
body {
    font-family: Arial, sans-serif;
    margin: 20px;
    line-height: 1.6;
    color: #333;
}
h1, h2, h3, h4, h5, h6 {
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

        button,
        select {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
        }
`;