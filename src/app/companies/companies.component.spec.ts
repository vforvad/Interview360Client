import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { StoreModule, Store } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'angular2-cookie/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../environments/environment';
import { Company } from './company.model';
import { UploaderModule } from '../shared/uploader/uploader.module';
import { CompaniesComponent } from './companies.component';
import { CompaniesRoutingModule } from './companies-routing.module';
import { FormComponent } from './form/form.component';
import { CompanyListItemComponent } from './item/item.component';
import { DetailComponent } from './detail/detail.component';
import { BaseComponent } from './base/base.component';
import { NgxSvgIconModule } from 'ngx-svg-icon';
import { DpDatePickerModule } from 'ng2-date-picker';
import * as fromApp from '../store/app.reducers';
import * as CompanyActions from './store/companies.actions';
import { PipeModule } from '../shared/pipe.module';
import { CompaniesService } from './companies.service';
import { ApiService } from '../shared/api.service';

const company = new Company(1, 'a', 'b', '2017-08-19', 'a');
const response = { companies: [
  {
    id: 1,
    name: 'aaa',
    description: 'awdawd',
    start_date: '2017-08-19',
    city: '1'
  }
]};

describe('CompaniesComponent', () => {
  let component: CompaniesComponent;
  let fixture: ComponentFixture<CompaniesComponent>;
  let companiesService: CompaniesService;
  let store: Store<fromApp.AppState>;
  let httpMock: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CompaniesComponent,
        CompanyListItemComponent
      ],
      imports: [
        NgxSvgIconModule,
        DpDatePickerModule,
        PipeModule,
        RouterTestingModule,
        HttpClientModule,
        HttpClientTestingModule,
        StoreModule.forRoot(fromApp.reducers),
        FileUploadModule,
        ReactiveFormsModule,
        UploaderModule
      ],
      providers: [
        CompaniesService,
        ApiService,
        CookieService
      ]
    }).compileComponents();


    fixture = TestBed.createComponent(CompaniesComponent);
    companiesService = TestBed.get(CompaniesService);
    spyOn(companiesService, 'loadList').and.callThrough();
    store = TestBed.get(Store);
    httpMock = TestBed.get(HttpTestingController);
    // let result = httpMock.expectOne(`${environment.baseUrl}/companies/`);
    // result.flush(response);
    // httpMock.verify();
    fixture.detectChanges();
    store.dispatch(new CompanyActions.CompaniesLoaded([company]));
    component = fixture.componentInstance;

  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('call loadList on componentsService instance', () => {
    expect(companiesService.loadList).toHaveBeenCalled();
  });
});
