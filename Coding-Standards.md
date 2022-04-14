# Coding Standards

## Overview

With the large number of developers working on a project, it is important to establish some basic Coding Standards in order to keep the code consistent and easy to understand for everyone.  Although personal style is important, we must follow some basic rules to make it easier for other developers to easily understand and modify any part of the code.  Also, these standards will help with improving overall code-quality.

----

### 1. Automated Styling

- [Prettier](https://prettier.io/) for automatic formatting of code and html
- [stylelint](https://stylelint.io/) for scss.  

**DO NOT** modify the config files for these unless signed-off by the leads! Changing any formatting settings could lead to modifying every file in the project.

----

### 2. Typescript

----

#### 2.2 Basic Guidelines
__Do__ follow the [Angular Coding Style Guide](https://angular.io/guide/styleguide) as much as possible

__Do__  use [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) when a style question is not defined in the _Angular Coding Style Guide_.

__Why?__ Following standard Angular coding styles keeps our code consistent with examples and follows best practices.

----

#### 2.2 Always Specify Types
__Do__ review the Typescript [Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html) 

__Do__ specify the type for all declared variables/function params.

__Consider__ providing a type only when Typescript can not deduce it.

__Why?__ Types are vital for static analysis of the code and preventing errors.  By using correct types the compiler can flag potential errors as soon as they are written.  Types also warn us when data structures change.

> Example
```typescript

const VALUE_STRING = 'The value is';  // (1) initializing to string type

class Example {
  private numberSquared: number;  // (2) declare as a number type

  get val(): number { // (3) val must return a number type
    return this.numberSquared;
  }

  constructor(value: number) {
    this.numberSquared = this.square(value);
  }

  private square(value: number): number { // (4) expects a number, returns a number
    return value * value; 
  }

  // no return value, so compileer assumes return type is void
  getLogValue(): string {  
    return `${VALUE_STRING}: ${this.numberSquared}`;
  }
}

const example2 = new Example('test'); // (5) ERROR! constructor expects a number

```

----

#### 2.3 Enumerations should be defined using PascalCase (UpperCamelCase).

__Do__ use PascalCase/UpperCamelCase for declaring enumeration values

__Why?__ Avoids confusion with Constants and is in line with how Angular defines enumeration values.

> Example
```typescript
// ** INCORRECT **
export enum ModifyTripDetailsDetailGridFields {
  BOL = 'bolInstId',
  ZIP_CODE = 'zip6',
  CUSTOMER = 'customerName',
  TRAILER_NBR = 'trailerNbr',
}

// ** Correct **
export enum ModifyTripDetailsDetailGridFields {
  Bol = 'bolInstId',
  ZipCode = 'zip6',
  Customer = 'customerName',
  TrailerNbr = 'trailerNbr',
}
```

----

### 3. HTML and SCSS

----

#### 3.1 Follow BEM naming conventions for classes.

__Do__ use [BEM](http://getbem.com/naming/) for styling

__Why?__ BEM provides a consistant, unique, and parsable way for naming CSS classes.

**BEM** stands for _Block-Element-Modifier_, where:

  * _Block_ is the overall section/component being styled
  * _Element_ is the descriptive sub-component
  * _Modifier_ is a modification the Element styling

You do not need to specify a Modifier if it is not needed.

You MAY use multiple Elements if needed. Each element is separated with `__` (double underscore).  

Always use `__` (double underscores) to separate Block from Element, and `--` (double dashes) to separate Element from Modifier. This allows us to use single `_` and `-` in the names.

```html
<div class="example-component">
  <div class="example-component__header>Example List</div>
  <ul class="example-component__first-list"> 
     <li class="example-component__first-list__item">Item One</li>
     <li class="example-component__first-list__item--bold">Item Two</li>
     <li class="example-component__first-list__item">Item 1 Three</li>
  </ul>
</div>
```

```css
.example-component {
  &__header {
     color: green;
     font-size: 20px;   
  }

  &__first-list {
     color: blue;

     &__item {
        font-size: 16px;

        &--bold {
          font-weight: bold;
        }
     }
  }

}
```

```html
<div class="modifyTripDetails">
  <div class="modifyTripDetails__header" data-test="modifyTripDetails-title">
    <div class="modifyTripDetails__header-title">
      Update Trip
    </div>
    <ng-container *ngTemplateOutlet="panelActions"></ng-container>
  </div>

  <hr />

  <div class="modifyTripDetails__body">
    <div class="modifyTripDetails__body__overview">
      <modify-trip-details-overview></modify-trip-details-overview>
    </div>

    <div class="modifyTripDetails__body__details">
      <div class="modifyTripDetails__body__details__header">
        <h1>Details</h1>
        <button mat-button smallButton (click)="showTripDetailsSection = !showTripDetailsSection">
          <mat-icon>{{ showTripDetailsSection ? 'visibility_off' : 'visibility' }}</mat-icon>
          {{ showTripDetailsSection ? 'Hide' : 'View' }} Trip Details
        </button>
      </div>
```

There's a clear hierarchy to the naming convention;
```css
  &__header {
    align-items: center;
    display: flex;
    flex-direction: row;
    height: 48px;
    justify-content: space-between;
    margin-bottom: $contentSpacing / 2;

    &--title {
      font-size: 1.9rem;
      font-weight: $fontWeight--bold;
      line-height: $header-lineHeight--large;
    }
  }
```

----

#### 3.2 Use existing colors and variables

__Do__ use the pre-defined SCSS color and layout variables

__Avoid__ creating new variables in app/component .scss files when the same value can be found in the base library.

__Why?__ colors/variables can be changed by UX in the library at any time.  By using the standard variables will automatically update to match the latest UX design.  

----

#### 3.3 Define local variables for custom values

__Do__ create custom SCSS variables at the top of scss files when specific values are required in the file.

__Avoid__ using constants in the body of the CSS and define variables instead.

__Why?__ It can be difficult to track down and update all uses of a constant in the SCSS when/if that value needs changed.  Also, variable names give some semantic meaning to the values being used and can help in understanding what the purpose is.

> Example
```scss
// **Incorrect**
.example {

  &__button1 {
    color: #ff2255;
    margin: 4px;
  }

  &__button2 {
    color: black;
    margin: 4px;
  }
}

// **Correct**
@import '~@core/styles/variables';

$button-color: #ff2255;
$button-margin: 4px;

.example {

  &__button1 {
    color: $button-color;
    margin: $button-margin;
  }

  &__button2 {
    color: $black;
    margin: $button-margin;
  }
}

```
----

### 4. NgRx Store

The Store is an instance of [NgRx](https://ngrx.io/docs) that managees state information about the app.

___NOTE___ Correct usage of the Store is crucial to keeping application performance in check!

___NOTE___ It is important to understand that the Store is used as a way of breaking tight coupling between components.  Different components should have as little knowledge of the other components as possible.

----

#### 4.1 Use the Store manage application State

__Do__ keep important, shared application state in the Store.

__Do__ react to changes in Store state to update components.

__Why?__ Storing key application State in a centralized Store allows various components and services to react to State changes by subscribing to parts of the State they care about. 

The Store State provides a way of communicating change amongst the various parts of the application, while avoiding tight coupling between components.

> Example: Listen to the Store State and react to changes

```typescript
@Service({})
class ExampleService implements OnDestroy {
    private unsubscriber = new Unsubscriber();

    constructor(private store$: Store<StoreState.State>) {
        this.tore$.select(GlobalFilterStoreSelectors.globalFilterCode).pipe(
            takeUntil(this.unsubscriber.done$)
        ).subscribe((code: string) => {
            // TODO - do something when the global SIC changes
        });
    }

    ngOnDestroy() {
        this.unsubscriber.complete();
    }
}

@Component({})
class ExampleComponent implements OnInit, OnDestroy {
    private unsubscriber = new Unsubscriber();

    constructor(private store$: Store<StoreState.State>) {}

    ngOnInit() {
        this.tore$.select(GlobalFilterSelectors.globalFilterCode).pipe(
            takeUntil(this.unsubscriber.done$)
        ).subscribe((code: string) => {
            // TODO - do something when the global Code changes
        });
    }

    ngOnDestroy() {
        this.unsubscriber.complete();
    }
}
```

----

#### 4.2 Keep th minimum amount of data in the Store as possible

__Do__ limit the amount of data managed by the Store 

__Avoid__ storing large data structures in the Store

__Why?__ Any modification to the Store state results in a complete copy of the entire Store.  If large data structures are kept in the Store, this will require copying all of the data every time the Store state changes, resulting in poor performance.

__Consider__ using a Service to manage the large data, and the Store to contain the ID of the data in the Service.

__Consider__ storing only primitive data (numbers, strings, booleans, enum values) in the store.

__Why?__ primitives take up very little space and can be copied quickly when the Store State changes.

----

#### 4.3 Use Feature stores to keep related data togetheer

__Do__ keep the main Store clean by using Feature Stores to hold state for a specific feature area.

__Why?__ Each feature sub-section of the store should hold only relevant information required for that section. 
 
 ----
 
 #### 4.4 Limit usage of Effects

 __Do__ use Effects when needed. Otherwise, avoid them.

 __Why?__ Effects are used to modfy the state of the Store outside of the normal Action/Reducer flow.  This can be as simple as triggering an additional Action, or as complex as asynchronuosly fetching data from an API and updating the Store or others service with the results.

__Consider__ if the desired behavior can more cleanly be implemented without using an Effect.

__Why?__ Since an Effect is litterally a side-effect of an Action, it can be difficult to fully know what is being handled by an Effect, making the code more complicated to underestand.
