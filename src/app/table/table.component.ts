import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { default as jsonData } from '../../assets/data';

interface TableRow {
  _id: string;
  isActive: boolean;
  balance: string;
  picture: string;
  age: number;
  name: {
    first: string;
    last: string;
  };
  company: string;
  email: string;
  address: string;
  tags: string[];
  favoriteFruit: string;
}

interface TableColumn {
  label: string;
  key: string;
  visible: boolean;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  searchText = '';
  pageSize = 5;
  currentPage = 1;
  rows: TableRow[] = [];
  filteredRows: TableRow[] = [];
  columns: TableColumn[] = [
    { label: 'Active', key: 'isActive', visible: true },
    { label: 'Balance', key: 'balance', visible: true },
    { label: 'First Name', key: 'name.first', visible: true },
    { label: 'Last Name', key: 'name.last', visible: true },
    { label: 'Company', key: 'company', visible: true },
    { label: 'Email', key: 'email', visible: true },
    { label: 'Address', key: 'address', visible: true },
    { label: 'Favorite Fruit', key: 'favoriteFruit', visible: true }
  ];

  ngOnInit() {
    this.rows = jsonData as TableRow[];
    this.filteredRows = [...this.rows];

    const searchControl = new FormControl();
    searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchText = value;
      this.filterRows();
    });
  }

  sortTable(key: string) {
    this.filteredRows.sort((a, b) => {
      const valueA = this.getValue(a, key);
      const valueB = this.getValue(b, key);
      return valueA.localeCompare(valueB);
    });
  }

  getValue(obj: TableRow, key: string): string {
    const keys = key.split('.');
    let value: unknown = obj;
    for (const k of keys) {
      if (typeof value !== 'object' || value === null || !(k in value)) {
        return '';
      }
      value = (value as Record<string, unknown>)[k];
    }
    return String(value);
  }

  updateSearch(text: string) {
    this.searchText = text;
    this.filterRows();
  }

  filterRows() {
    if (!this.searchText) {
      this.filteredRows = [...this.rows];
    } else {
      const searchTextLower = this.searchText.toLowerCase();
      this.filteredRows = this.rows.filter(row => {
        for (const column of this.columns) {
          if (column.visible && this.getValue(row, column.key).toLowerCase().includes(searchTextLower)) {
            return true;
          }
        }
        return false;
      });
    }
  }

  toggleColumnVisibility() {
    this.filterRows();
  }

  showPagination(): boolean {
    return this.columns.some(column => column.visible);
  }
}
