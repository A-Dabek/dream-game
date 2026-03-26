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
    { id: 'punch', genre: 'basic' },
    { id: 'hand', genre: 'basic' },
    { id: 'sticky_boot', genre: 'basic' },
    { id: 'wingfoot', genre: 'basic' },
  ];

  poisonItems: Item[] = [
    { id: 'gas_grenade', genre: 'poison' },
    { id: 'poison_drink', genre: 'poison' },
    { id: 'poison_darts', genre: 'poison' },
    { id: 'antidote', genre: 'poison' },
  ];

  doctorItems: Item[] = [
    { id: 'stitches', genre: 'doctor' },
    { id: 'adrenaline', genre: 'doctor' },
    { id: 'drip', genre: 'doctor' },
  ];

  activeItem: Item = { id: 'punch', genre: 'basic' };

  blueprintItems: Item[] = [
    { id: '_blueprint_attack', genre: 'basic' },
    { id: '_blueprint_heal_5', genre: 'basic' },
  ];
}
