import { Routes } from '@angular/router';
import { ExerciseComponent } from './pages/exercise/exercise.component';
import { ResultComponent } from './pages/result/result.component';
import { SearchComponent } from './pages/search/search.component'

export const routes: Routes = [
  {path:'search',component:SearchComponent},
  {path:'exercise',component:ExerciseComponent},
  {path:'result',component:ResultComponent}
];

