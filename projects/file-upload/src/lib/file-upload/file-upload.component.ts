import { Component, Input, OnInit, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lib-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploadComponent,
      multi: true
    }
  ]
})
export class FileUploadComponent implements OnInit, ControlValueAccessor {

  @Input() inputId: string = "fileInput";
  @Input() class: string = "";
  @Input() sizeLimit!: number;
  @Input() fileSize = 0.0;
  @Input() fileName = 'Carregar um ficheiro';
  @Input() disabled = false;
  @Input() multiple = false;
  @Input() showOpenFile = false;
  @Input() canOpen = false;
  @Input() accept: string = '*';
  @Output() onSelectFile = new EventEmitter<any>();
  private file: File | null = null;
  // private files: FileList | null = null;
  onChange!: Function;
  errorMessage = '';
  selectedFileName!: string;
  selectedFiles!: File[];

  constructor(private host: ElementRef<HTMLInputElement>) { }

  ngOnInit(): void {

  }

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    if (this.multiple) {
      const files = event;
      this.onChange(files);
      this.selectedFiles = Array.from(files) ;
    } else {
      const file = event && event.item(0);
      this.onChange(file);
      this.file = file;
    }
  }

  writeValue(value: any) {
    this.host.nativeElement.value = '';
    this.file = null;
    this.selectedFiles = [];
    if (value && !this.multiple) {
      this.file = value;
      this.selectedFileName = value.name;
      this.fileSize = value.size;
    } else if (value && this.multiple) {
      this.selectedFiles = value;
    }
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  getFileSize(size?: number): number {
    return size ? Number(((size / 1024) / 1024).toFixed(3)) : Number(((this.fileSize / 1024) / 1024).toFixed(3));
  }


  uploadEvent(event: any) {
    if (this.multiple) {
      this.uploadMultiplo(event)
    } else {
      this.uploadUnico(event);
    }

  }

  uploadUnico(event: any) {
    this.errorMessage = '';

    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;

    if (this.sizeLimit && files[0].size > this.sizeLimit) {
      this.errorMessage =
        `O tamanho do ficheiro deve ser inferior a ${this.sizeLimit}!`;
      return;
    }

    var extension = files[0].name.substr(files[0].name.lastIndexOf('.'));
    if (this.accept != '*' && !this.accept.split(',').some(x => x.toLowerCase() == extension.toLowerCase())) {
      this.errorMessage =
        `Formato de ficheiro não suportado, submeta um ficheiros do tipo: ${this.accept}`;
    } else {
      //this.files.push(files[0]);
      //this.onUpdateFiles.emit(this.files);
      this.fileSize = files[0] ? files[0].size : 0;
      this.selectedFileName = files[0].name;
      this.onSelectFile.emit(files[0]);
    }
  }

  uploadMultiplo(event: any) {
    this.errorMessage = '';
    const target = event.target as HTMLInputElement;
    const newFiles = Array.from(target.files as FileList)
    if(this.selectedFiles){
      this.onAddNewFiles(newFiles);
      return;
    }
    this.selectedFiles = newFiles;
  }

  private onAddNewFiles(newFiles:File[]){
    newFiles?.forEach((itemFile:File) =>{
      this.selectedFiles.push(itemFile);
    })
  }

  verFicheiro(index?: number) {
    var fileToShow;
    if (index && index >= 0) {
      fileToShow = this.selectedFiles[index];
    } else if (this.file) {
      fileToShow = this.file;
    } else
      return
    const blob = new Blob([fileToShow], { type: fileToShow.type });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }

}
