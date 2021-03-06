import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {User} from "../models/user.model";
import {AuthentificationService} from "../services/authentification.service";
import {MediaMatcher} from "@angular/cdk/layout";
import {NavigationStart, Router} from "@angular/router";
import {UserService} from "../services/user.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ConnectionDialogComponent} from "./matDialogs/connection-dialog/connection-dialog.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {

  Accueil = 'Accueil';

  connectedUser: User;

  mobileQuery: MediaQueryList;

  currentPage: string;

  currentTime: Date = new Date();

  authentificationDialog: MatDialogRef<ConnectionDialogComponent>

  private readonly _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private authService: AuthentificationService,
              private router: Router, private userService: UserService, private matDialog: MatDialog) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log(event.url);
        this.currentPage = event.url;
        this.userService.pageObservable$.next(event.url);
      }
    })

    setInterval(() => {
      this.currentTime = new Date();
    }, 1);
  }

  ngOnInit(): void {
    this.authService.loggedUser$.subscribe((user) => {
      this.connectedUser = user;
    })
    console.log(this.connectedUser);
    console.log("userIsAuthenficated : " + this.authService.userIsAuthentified);
  }

  async logOutUser() {
    this.authService.logOff(this.connectedUser);
    this.authService.userIsAuthentified = false;
    this.authentificationDialog = this.matDialog.open(ConnectionDialogComponent, {
      hasBackdrop: true
    })
    this.authentificationDialog.componentInstance.message = "Déconnexion";
    await this.router.navigate(['/accueil']);
  }

  pageChecker() {
    if (this.currentPage === '/user-sign-in')
      return false;
    if (this.currentPage === '/user-form')
      return false;
    if (this.currentPage === '/quiz-form')
      return false;
    if (this.currentPage.includes('/lancement'))
      return false;
    if (this.currentPage.includes('/edit-quiz'))
      return false;

    return true;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

}
