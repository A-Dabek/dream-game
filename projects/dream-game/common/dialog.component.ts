import { Component, ElementRef, ViewChild, input, output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  template: `
    <dialog #dialogRef class="confirmation-dialog">
      <p>{{ message() }}</p>
      <div class="buttons">
        <button (click)="close(false)">No</button>
        <button (click)="close(true)">Yes</button>
      </div>
    </dialog>
  `,
  styles: `
    .confirmation-dialog {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 24px;
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .confirmation-dialog::backdrop {
      background-color: rgba(0, 0, 0, 0.4);
    }

    p {
      margin: 0 0 16px 0;
      font-size: 16px;
    }

    .buttons {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    button {
      padding: 8px 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #f9f9f9;
      cursor: pointer;
      font-size: 14px;
    }

    button:hover {
      background: #e9e9e9;
    }
  `,
})
export class DialogComponent {
  readonly message = input.required<string>();
  readonly confirmed = output<boolean>();

  @ViewChild('dialogRef', { static: true })
  private readonly dialogRef!: ElementRef<HTMLDialogElement>;

  open(): void {
    this.dialogRef.nativeElement.showModal();
  }

  close(confirmed: boolean): void {
    this.confirmed.emit(confirmed);
    this.dialogRef.nativeElement.close();
  }
}
