import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // Itt AppComponent-nek kell lennie, nem App-nak

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));