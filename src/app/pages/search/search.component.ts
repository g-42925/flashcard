import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component,OnInit,inject } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-search',
  imports: [CommonModule,FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  filter = ''
  
  http = inject(HttpClient)
  source = environment.source
  words:any[] = []
  filtered:any[] = []

  ngOnInit(){
    var headers = new HttpHeaders({'ngrok-skip-browser-warning':'ok'})
    this.http.get<any[]>(this.source,{headers,withCredentials:true}).subscribe({
      next:r => {
        this.words = r
      }
    });
  }

  onFilterChange(e:any){
    var tmp:any[] = []
    this.words.map((word,index) => {
      if(word.romaji.includes(this.filter)){
        tmp.push(word)
      }

      if(index === this.words.length -1){
        this.filtered = tmp
      }
    })
  }
}
