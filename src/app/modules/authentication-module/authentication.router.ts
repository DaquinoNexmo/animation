import { Routes, RouterModule } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';

const SIGN_IN_ROUTER: Routes = [
    {
        path: '',
        component: SignInComponent
    }
];

export const signinRouter = RouterModule.forChild(SIGN_IN_ROUTER);