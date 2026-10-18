import { render } from 'preact';
import App from './App.jsx';
import { migrateLegacyKeys } from './utils/storage.js';
import './styles.css';
import './styles/home-od.css';
import './styles/learn.css';

migrateLegacyKeys();

render(<App />, document.getElementById('app'));
