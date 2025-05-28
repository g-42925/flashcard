import { Routes } from '@angular/router';
import { ExerciseComponent } from './pages/exercise/exercise.component';
import { ResultComponent } from './pages/result/result.component';

export const routes: Routes = [
  {path:'exercise',component:ExerciseComponent},
  {path:'result',component:ResultComponent}
];

