import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import {
  MdSidenavModule,
  MdToolbarModule,
  MdIconModule,
  MdListModule,
  MdCardModule
} from '@angular/material';
import { By } from '@angular/platform-browser';
import { StoreModule, Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { DebugElement }    from '@angular/core';

import { User } from '../auth/user.model';
import { reducers } from '../store/app.reducers';
import { AuthService } from '../auth/auth.service';
import * as fromApp from '../store/app.reducers';
import * as AuthActions from '../auth/store/auth.actions';
import { ApiService } from '../shared/api.service';
import {HttpClientModule} from '@angular/common/http';
import { MockStore } from '../shared/mock.store';

const user = new User(1, 'example@mail.com', 'a', 'b');

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let de: DebugElement;
  let store: Store<fromApp.AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        HeaderComponent
      ],
      imports: [
        MdSidenavModule,
        MdToolbarModule,
        MdIconModule,
        MdListModule,
        MdCardModule,
        StoreModule.forRoot(reducers),
        HttpClientModule
      ],
      providers: [
        AuthService,
        ApiService,
        CookieService
      ]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    store = TestBed.get(Store)
    spyOn(store, 'dispatch').and.callThrough();
    component = fixture.componentInstance;
    fixture.detectChanges();
    de = fixture.debugElement;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('has current user email if user is present', () => {
    const action = new AuthActions.CurrentUserReceived(user);
    store.dispatch(action);

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.user.email).toEqual(user.email);
    });
  });

  it('element contains user email if user is present', () => {
    const action = new AuthActions.CurrentUserReceived(user);
    store.dispatch(action);

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const userEmail = de.query(By.css('.settings-block')).nativeElement;
      expect(userEmail.textContent).toContain('Sign out');
    });
  });
});
