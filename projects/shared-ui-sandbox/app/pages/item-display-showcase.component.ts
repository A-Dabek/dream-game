import { Component } from '@angular/core';
import { ItemDisplayComponent } from '@shared-ui';
import { Item } from '@dream/game-board';

@Component({
  selector: 'app-item-display-showcase',
  standalone: true,
  imports: [ItemDisplayComponent],
  template: `
    <section>
      <h1>Item Display Component</h1>

      <section>
        <h2>Basic Items</h2>
        <div class="item-grid">
          @for (item of basicItems; track item.id) {
            <app-item-display [item]="item" />
          }
        </div>
      </section>

      <section>
        <h2>Poison Items</h2>
        <div class="item-grid">
          @for (item of poisonItems; track item.id) {
            <app-item-display [item]="item" />
          }
        </div>
      </section>

      <section>
        <h2>Doctor Items</h2>
        <div class="item-grid">
          @for (item of doctorItems; track item.id) {
            <app-item-display [item]="item" />
          }
        </div>
      </section>

      <section>
        <h2>Active State</h2>
        <div class="item-grid">
          <app-item-display [item]="activeItem" [active]="true" />
        </div>
      </section>

      <section>
        <h2>Blueprint Items</h2>
        <div class="item-grid">
          @for (item of blueprintItems; track item.id) {
            <app-item-display [item]="item" />
          }
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      section {
        margin-bottom: 2rem;
      }
      h1 {
        font-size: 2rem;
        margin-bottom: 1.5rem;
      }
      h2 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #666;
      }
      .item-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }
    `,
  ],
})
export class ItemDisplayShowcaseComponent {
  basicItems: Item[] = [
    { id: 'punch', genre: 'basic', remainingUsages: 1 },
    { id: 'hand', genre: 'basic', remainingUsages: 1 },
    { id: 'sticky_boot', genre: 'basic', remainingUsages: 1 },
    { id: 'wingfoot', genre: 'basic', remainingUsages: 1 },
  ];

  poisonItems: Item[] = [
    { id: 'gas_grenade', genre: 'poison', remainingUsages: 1 },
    { id: 'poison_drink', genre: 'poison', remainingUsages: 1 },
    { id: 'poison_darts', genre: 'poison', remainingUsages: 3 },
    { id: 'antidote', genre: 'poison', remainingUsages: 1 },
  ];

  doctorItems: Item[] = [
    { id: 'stitches', genre: 'doctor', remainingUsages: 1 },
    { id: 'adrenaline', genre: 'doctor', remainingUsages: 1 },
    { id: 'drip', genre: 'doctor', remainingUsages: 1 },
  ];

  activeItem: Item = { id: 'punch', genre: 'basic', remainingUsages: 1 };

  blueprintItems: Item[] = [
    { id: '_blueprint_attack', genre: 'basic', remainingUsages: 1 },
    { id: '_blueprint_heal_5', genre: 'basic', remainingUsages: 1 },
  ];
}
