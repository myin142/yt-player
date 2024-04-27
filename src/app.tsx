import * as ReactDOM from 'react-dom/client';
import YoutubePlayerPage from './youtube-player/YoutubePlayerPage';

function render() {
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<YoutubePlayerPage/>);
}

render();
