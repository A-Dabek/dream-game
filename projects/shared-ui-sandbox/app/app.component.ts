import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main>
      <nav>
        <a routerLink="/icon">Icon Component</a>
        <a routerLink="/item-display">Item Display Component</a>
      </nav>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      main {
        padding: 2rem;
        font-family:
          system-ui,
          -apple-system,
          sans-serif;
      }
      nav {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #ccc;
      }
      a {
        color: #0066cc;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class AppComponent {}
