import * as ReactDOM from 'react-dom/client';
import YoutubePlayerPage from './youtube-player/YoutubePlayerPage';

function render() {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<YoutubePlayerPage/>);
}

render();
