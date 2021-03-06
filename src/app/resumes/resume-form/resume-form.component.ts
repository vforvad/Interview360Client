import { Component, OnInit, OnDestroy, DoCheck } from '@angular/core';
import {
  FormGroup, FormControl, FormArray, Validators, AbstractControl
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import {Router, ActivatedRoute, Params} from '@angular/router';

import { Resume } from '../resume.model';
import { User } from '../../auth/user.model';
import { Contact } from '../contact.model';
import { Skill } from '../../shared/skills/skill.model';
import { SkillsService } from '../../shared/skills/skills.service';
import { ResumesService } from '../resumes.service';
import * as fromApp from '../../store/app.reducers';
import * as ResumesActions from '../store/resumes.actions';

@Component({
  selector: 'app-resume-form',
  templateUrl: './resume-form.component.html',
  styleUrls: ['./resume-form.component.scss']
})
export class ResumeFormComponent implements OnInit, OnDestroy {
  resumeForm: FormGroup;
  resumeFormErrors: {} = {};
  skillsSubscription: Subscription;
  userSubscription: Subscription;
  workplacesSubscription: Subscription;
  searchedSkills: Skill[];
  selectedSkills: Skill[] = [];
  popupsShowing: {} = {};
  values: {} = {};
  currentUser: User;
  workplacesList: any[];
  public currentPopupId: string;
  resume: Resume;
  contact: {};
  nestedObjectError: {} = {};
  nestedFormValidationMessage = 'Invalid data. Check form for more.';

  constructor(private store: Store<fromApp.AppState>,
              private resumesService: ResumesService,
              private activatedRoute: ActivatedRoute,
              private skillsService: SkillsService,
              private location: Location) { }

  ngOnInit() {
    this.handleFormInit();
    this.handleChangeRouter();
    this.handleSkillsSubscription();
    this.handleUserSubscription();
    this.handleWorkplaceSubscription();
  }

  ngOnDestroy(){
    this.popupsShowing['skills'] = false;
    this.skillsSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.workplacesSubscription.unsubscribe();
    const formValue = {
      ...this.resumeForm.value,
      selectedSkills: this.selectedSkills,
      workplaces: this.workplacesList,
      contact: this.contact
    };
    this.resumesService.saveForm(formValue);
    this.skillsService.removeSkills();
  }

  submit() {
    const params = this.resumeForm.value;
    params['salary'] = parseFloat(params['salary'].toString());
    params['skills'] = this.selectedSkills.map(item => item.id);
    params['user_id'] = this.currentUser.id;
    params['workplaces'] = this.workplacesList;
    params['contact'] = this.contact;
    if (this.resume && this.resume.id) {
      this.resumesService.updateResume(this.resume.id, params);
    } else {
        this.resumesService.createResume(params);
    }
  }

  selectSkill(skill: Skill) {
    const ids = <Object[]>this.selectedSkills.map(item => item.id);
    if (!ids.includes(skill.id)) {
      this.selectedSkills.push(skill);
    }
    this.popupsShowing['skills'] = false;
    (<FormControl>this.resumeForm.get('skills')).setValue([]);
  }

  searchSkills(event: any) {
    this.skillsService.searchSkills(event.target.value);
  }

  addSkill(skill: Skill) {
    let skills = this.resumeForm.value.skills.map(item => item.id);
    if (!skills.includes(skill.id)) {
        this.setSkillToForm(skill);
    }
  }

  deleteSkill(skill: Skill) {
    const idx = this.selectedSkills.findIndex(
      item => item.id == skill.id
    );
    if (idx !== -1) {
      this.selectedSkills.splice(idx, 1);
    }
  }

  returnBack() {
    this.location.back();
  }

  private setSkills(detail: Resume) {
    if (detail.skills) {
      const skillsArr = detail.skills.map(item => {
        return new FormControl(item, Validators.required);
      });
      this.resumeForm.setControl('skills', new FormArray(skillsArr));
    }
  }

  private setSkillToForm(skill: Skill) {
    const control = new FormControl(skill, Validators.required);
    (<FormArray>this.resumeForm.get('skills')).push(control);
  }

  private handleFormInit() {
    this.resumeForm = new FormGroup({
      'title': new FormControl(null, [Validators.required]),
      'description': new FormControl(null, [Validators.required]),
      'salary': new FormControl(null, [Validators.required]),
      'skills': new FormControl(null)
    });
  }

  private handleChangeRouter() {
    this.activatedRoute.params.subscribe((params: Params) => {
      const resumeId = params['id'];
      if (resumeId) {
          this.resumesService.getResume(resumeId);
      }
      else {
        if (this.resumeForm) {
          this.resumeForm.patchValue({
            'title': null,
            'description': null,
            'salary': null,
            'skills': []
          });
        }
      }
    });
  }

  private handleSkillsSubscription() {
    this.skillsSubscription = this.store.select('skills').subscribe(
      data => {
        if (data.list.length > 0) { this.popupsShowing['skills'] = true; }
        this.values['skills'] = data.list;
      }
    );
  }

  private handleUserSubscription() {
    this.userSubscription = this.store.select('auth').subscribe(
      data => {
        if (data.currentUser) {
          this.currentUser = data.currentUser;
        }
      }
    );
  }

  private handleWorkplaceSubscription() {
    this.workplacesSubscription = this.store.select('resumes').subscribe(
      data => {
        if (data.detail) {
          this.resume = data.detail;
          this.resumeForm.patchValue({
            'title': this.resume.title,
            'description': this.resume.description,
            'salary': this.resume.salary
          });
          if (this.resume.skills) {
            this.selectedSkills = this.resume.skills;
          }
          if (this.resume.workplaces) {
            this.workplacesList = this.resume.workplaces.map(item => {
              const newItem = {
                ...item,
                resume_id: item.resume.id,
                company: item.company.name
              };
              delete newItem['resume'];
              delete newItem['updated_at'];
              return newItem;
            });
          }
          if (this.resume.contact) {
            this.contact = {
              ...this.resume.contact,
              resume_id: this.resume.id
            };
            delete this.contact['resume'];
            delete this.contact['updated_at'];
          }
        }
        if (Object.keys(data.form).length > 0) {
          this.resumeForm.patchValue({
            ...data.form
          });
          this.workplacesList = data.form.workplaces;
          this.selectedSkills = data.form.selectedSkills;
          this.contact = data.form.contact;
        }
        if (data.formErrors) {
          this.resumeFormErrors = data.formErrors;
          if (this.resumeFormErrors['contact']) {
            this.setNestedFormErrors('contact');
          }
          if (this.resumeFormErrors['workplaces']) {
            this.setNestedFormErrors('workplaces');
          }
        }
      }
    );
  }

  private setNestedFormErrors(key) {
    if (this.resumeFormErrors[key] instanceof Object) {
      this.nestedObjectError[key] = true;
    } else {
      this.nestedObjectError[key] = false;
    }
  }

  isErrorObject(key) {
    let result = null;

    if (this.resumeFormErrors[key] instanceof Array) {
      result = this.resumeFormErrors[key];
    } else {
      result = this.nestedFormValidationMessage;
    }
    return result;
  }
}
