# Testing

**_You should be spending at least as much time thinking about and writing Unit Tests as you do implementing the feature._**

## Overview

- Unit tests need to be very specific to the unit of code (function) that you are testing. Unit tests are about ensuring a specific function works in a specific way given specific inputs.

- You should test every code path, or as many as you can, in the tests. This should include at least one test where the function works correctly, and one where it needs to handle a typical error condition.

- Read the [Angular Testing Documentation](https://angular.io/guide/testing) to understand the basics of testing with Angular.

- Use [ngMocks](https://ng-mocks.sudo.eu/api/MockBuilder) which provides many common functions for mocking.

- _Read and understand the documentation for ngMocks._
- **ONLY** mock what is being used in the test. Mocking an entire module may be easy, but will slow down test execution.

---

### 1. Mocking

---

#### 1.0 Mock Everything

**Do** mock (ie, create fake versions of) any Service, Component, or other external code to the function being tested.

**Why?** The goal of unit testing is to test a specific unit of code (usually a single function) to ensure it acts as expected given various inputs. The best way to do this is by using mocks for all external functions.

**Do** use spies for internal functions called by the function under test and returning known values.

**Why?** Unit tests should not rely on other functions in the code to be correct, only that the function under test works correctly given the possible inputs.

> Example:

```typescript
@Injectable({
  providedIn: "root",
})
class SampleService {
  constructor(
    private timeService: TimeService,
    private logService: LogService
  ) {}

  init() {
    // log the time the service is initialized
    this.logService.log(
      `SampleService.init was called at ${this.timeService.currentTime()}`
    );
  }
}

describe("SampleService", () => {
  let service: SampleService;

  let timeService: jasmine.SpyObj<TimeService>;
  let logService: jasmine.SpyObj<LogService>;

  beforeEach(() => {
    return (
      MockBuilder(SampleService)
        // providers
        .mock(TimeService)
        .mock(LogService)
    );
  });

  beforeEach(() => {
    timeService = TestBed.inject(TimeService) as jasmine.SpyObj<TimeService>;
    timeService.currentTime.and.returnValue("14:25");
    logService = TestBed.inject(LogService) as jasmine.SpyObj<LogService>;

    service = TestBed.inject(SampleService);
  });

  it("should be created", () => {
    expect(service).toBeDefined();
  });

  describe("init", () => {
    it("should log time when the service is created", () => {
      service.init();

      expect(timeService.currentTime).toHaveBeenCalled();
      expect(logService.log).toHaveBeenCalledWith(
        "SampleService.init was called at 14:25"
      );
    });
  });
});
```

---

#### 1.1 Use the MockBuilder to mock out the item in test:

**Do** use ngMock's MockBuilder for configuring Test suite

**Why?** ngMocks provides a consistant why for initializing TestBed and mocking the various Services, Components, etc. that are needed in unit tests.

> Example

```typescript
beforeEach(() => {
  return MockBuilder(SicMetricsAutoRefreshService)
    .provide(provideMockStore({ initialState: initialStoreState() }))
    .mock(SicMetricsCriteriaService, {
      filterFromCriteria: jasmine.createSpy().and.returnValue(of(mockFilter)),
    })
    .mock(CityOperationsApiService)
    .mock(XpoLtlAuthenticationService, {
      isAuthorized: () => of(true),
    })
    .mock(XrtFireMessagingService, {
      changedDocument$: jasmine.createSpy().and.returnValue(
        of({
          filterHash: "",
          documents: JSON.stringify([]) as any,
        })
      ),
    })
    .mock(XrtFireMessagingTokenService, {
      getToken$: () => of(mockToken),
    });
});
```

---

#### 1.2 Use Existing Mock Providers when Available

**Do** use Angular provided Testing modules.

- [HttpClientTestingModule](https://angular.io/guide/http#testing-http-requests)
- [RouterTestingModule](https://angular.io/api/router/testing/RouterTestingModule#routertestingmodule)

**Why?** These services can be difficult to mock correctly. Using a standard mock allows all tests to be consistant in how it is done and provides common defaults.

###### Mocking Store

Use the following code to correctly provide the mock Store:

```typescript
const initialStoreState = (): StoreState.State => {
  return { ...StoreState.initialState };
};

beforeEach(() => {
  return MockBuilder(Sample).provide(
    provideMockStore({ initialState: initialStoreState() })
  );
});
```

---

#### 1.3 Mocking a Class

In some instances you may need to mock a class instance. To do this, use the `MockClass()` function. It creates a `jasmine.SpyObj` for the specified class.

> Example

```typescript
class SampleClass {
  addQuotesTo(str: string): string {
    return `"${str}"`;
  }

  performAsyncFunc$(): Observable<number> {
    return interval(1000).pipe(tap((val) => console.log(val)));
  }
}

describe("Unit Test", () => {
  let mock: jasmine.SpyObj<SampleClass>;

  beforeEach(() => {
    mock = MockClass(SampleClass, {
      // You can pass functions/params to override default spy
      performAsyncFunc$: () => of(1234),
    });

    // all functions in the class are exposed as spies
    mock.addQuotesTo.and.returnValue("fake result");
  });

  it("should execute mocked version of functions", () => {
    const result = mock.addQuotesTo("test");
    expect(result).toEqual("fake result");
    expect(mock.addQuotesTo).toHaveBeenCalledWith("test");

    const result$ = mock.performAsyncFunc$();
    expect(result$).toBeObservable(cold("(a|)", { a: 1234 }));
  });
});
```

---

#### 1.4 Match Order of Injected Providers to Mock Creation

**Do** match the order of the injected mocks to the order they appear in the constructor of the service/component.

**Why?** It can be difficult to determine if all services for a class have been mocked when many Services are being injected. By matching the order between the constructor and the mock definitions it is easier to see if all the Services have been mocked or if there are any duplicates.

**Avoid** mocking any Service that is not required.

**Why?** Mocking uneccessary providers can lead to slower test execution and confusion over what is being tested.

> Example

```typescript
class Alpha {
  constructor(
    private serviceA: ServiceA,
    private serviceB: ServiceB,
    private serviceC: ServiceC
  ) {}
}

beforeEach(() => {
  return (
    MockBuilder(ComponentToTest)
      // the mocks should be defined in the same order as in constuctor
      .mock(ServiceA)
      .mock(ServiceB)
      .mock(ServiceC)
  );
});
```

---

#### 1.5 Naming Mocked Variables and Factory Functions

**Consider** naming mocked variables `mockXYX`.

**Why?** Makes it clear that the variable in question is specifically a mock value.

**Do** name mock generator functions `createMockXYZ()`, where `XYZ` is the name of the thing being mocked.

**Why?** Naming factory functions like this makes it clear that the purpose of the function is to create a mock instance.

For example: `createMockTrip()`

> Example

```typescript
const mockTrip = { tripInstId: 1234 } as Trip;

const createMockRoute = (routeInstId: number): Route => {
  return {
    routeInstId,
  } as Route;
};

const mockRoute = createMockRoute(5678);
```

---

#### 1.6 Correctly Type Mocks

**Do** Ensure mock variables have the correct type.

**Why?** Using th correct types allows for static type checking. This will alert through compile and linting errors if any data structures change and that the test needs to be updated.

**Avoid** implicite `any`. Instead, declare variables with the correct type, and use `as XYX` or prefix with `<XYZ>` to coerce the mocked object to the correct type.

> Example

```typescript
interface MyData {
  value: number;
}

class MyClass implements MyData {
  value: number;
  data: string;
}

const mockData1: MyData = { value: 111 };
const mockData2 = { value: 222 } as MyClass;
const mockData3 = <MyClass>{ value: 333 };
```

---

#### 1.7 Only use `any` for spying on private/protected methods

**Avoid** casting to `any`

**Do** cast to `<any>` when there is a need to spyOn a private/protected function.

**Why?** Type safety is important for ensuring tests run correctly and catch errors

**Do** disable tslint rule `no-any` for uses of `spyOn<any>`.

**Why?** Disabling the rule globally would allow for unintended errors in the file. Casting to `any` should be rare and specifically called out in the code to avoid hard to find and fix errors.

> Example

```typescript
it("should call a protected function", () => {
  // tslint:disable-next-line:no-any
  const funcSpy = spyOn<any>(service, "myProtectedFunction");

  service.doThing();

  expect(funcSpy).toHaveBeenCalled();
});

// If there are multiple spies, then group them together and wrap in
// tslint `disable/enable`

it("should call a protected function", () => {
  // tslint:disable:no-any
  const myProtectedSpy = spyOn<any>(service, "myProtectedFunction");
  spyOn<any>(service, "myPrivateFunction");
  // tslint:enable:no-any
  spyOn(service, "myPublicFunction");

  service.doThing();

  expect(myProtectedSpy).toHaveBeenCalled();
  expect(service["myPrivateFunction"]).not.toHaveBeenCalled();
  expect(service.myPublicFunction).toHaveBeenCalled();
});
```

---

#### 1.8 Use Property Access for private/protected Members

**Do** use property access syntax for accessing private/protected functions or variables in tests instead of casting to `any`.

**Wny?** If the signature of the function ever changes, you will not get an error. This could lead to invalid unit tests. Instead, use the property access syntax to get the function. This will preserve the typing of the function and its parameters.

> Example

```typescript
// INCORRECT - DO NOT cast to `any` to gain access to private function
(<any>component).somePrivateFunction(param1, param2);

// CORRECT - use property access syntax
component["someFunction"](param1, param2);
```

---

### 2. Handling ngOnInit (and other Angular Lifecycle Events)

---

#### 2.0 spyOn ngOnInit

**Do** spyOn ngOnInit to prevent it being executed before every test

**Why?** Component tests will execute the `ngOnInit` method whenever the component is created by the fixture. This can lead to errors/inconsistencies in the tests depending on what initialization happens in the ngOnInit method.

To solve this, we can spy on the ngOnInit method before the fixture creates the Component. This will prevent the method from running before every test. Then, in order to test ngOnInit itself, we can callThrough on the spy and then call ngOnInit directly.

> Example

```typescript
@Component({})
class SomeComponent implements OnInit {
  private wasInitCalled: boolean = false;

  ngOnInit() {
    this.wasInitCalled = true;
  }
}

describe("SomeComponent", () => {
  let component: SomeComponent;
  let fixture: ComponentFixture<SomeComponent>;
  let ngOnInitSpy: jasmine.Spy;

  beforeEach(() => {
    ngOnInitSpy = spyOn(SomeComponent.prototype, "ngOnInit");

    // ngOnInit will now be a spy, and calling it won't execute it
    fixture = TestBed.createComponent(SomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe("ngOnInit", () => {
    beforeEach(() => {
      ngOnInitSpy.and.callThrough(); // this allows us to execute ngOnInit
    });

    it("should do initialization things", () => {
      component.ngOnInit();
      expect(component["wasInitCalled"]).toBe(true);
    });
  });
});
```

---

### 3. Testing Observables

---

#### 3.1 Use Marble Testing

**Do** use [jasmine-marbles](https://medium.com/@bencabanes/marble-testing-observable-introduction-1f5ad39231c) for testing Observables

**Why?** Using `subscribe` to test an observable can lead to unexectued `expect`statements if the Observable never emits an event. This can result in the test "passing" since no expectation was failed.

General information about marble testing can be found in the [RxJS documentation](https://rxjs-dev.firebaseapp.com/guide/testing/internal-marble-tests).

> Example

```typescript
it("should call listOptimizerRoutesByRouteInst if the current sic optimize feature is active", () => {
  featureService.getFeatureValue.and.returnValue("Y");

  const expected$ = cold("(a|)", { a: mockTrips });
  const result$ = service["fetchTrips"](mockCriteria);

  expect(result$).toBeObservable(expected$);
  expect(
    optimizeService.listPnDOptimizerRoutesByRouteInst
  ).toHaveBeenCalledWith([1234, 5678]);
  expect(updateTripsSpy).toHaveBeenCalled();
  expect(service.loading$).toBeObservable(cold("a", { a: false }));
});
```

---

#### 3.2 Avoid async/fakeAsync by Mocking Internal Observables

**Do** mock Observables that are called by the function being tested so that they immediately return a value.

**Why?** Tests should be as deterministic as possible. In most cases, the result of an Observable being subscribed to in a function can be mocked with `of` or `throwError`, so that the test can execute synchronously.

> Example

```typescript
// AVOID subscribing to an Observable function for testing!
it('should hide "SHOW" option when driver does not belong to the selected routes', fakeAsync(() => {
  tripRenderingService.isShowingBreadcrumbs.and.returnValue(false);
  const selectedRoutes: Route[] = [
    {
      ...new Route(),
      routeInstId: 1111,
    },
  ];
  dispatcherTripsRouteRenderingService["selectedRoutes$"] = of(selectedRoutes);
  layoutPreferenceService.isDispatcherLayout.and.returnValue(true);

  const option: BreadcrumbsOptions = BreadcrumbsOptions.SHOW;
  const marker: DriverMapMarker = new DriverMapMarker();
  marker.markerInfo = {
    tripInstId: 9999,
    routes: [],
  } as DriverMapMarkerInfo;

  service
    .shouldHideOption(option, marker.markerInfo.tripInstId, marker)
    .subscribe((value) => {
      expect(value).toBe(true);
    });

  tick();
}));

// DO use marbles for removing the fakeAsync and subscription
it('should hide "SHOW" option when driver does not belong to the selected routes', () => {
  tripRenderingService.isShowingBreadcrumbs.and.returnValue(false);
  const selectedRoutes: Route[] = [
    {
      ...new Route(),
      routeInstId: 1111,
    },
  ];
  dispatcherTripsRouteRenderingService["selectedRoutes$"] = of(selectedRoutes);
  layoutPreferenceService.isDispatcherLayout.and.returnValue(true);

  const option: BreadcrumbsOptions = BreadcrumbsOptions.SHOW;
  const marker: DriverMapMarker = new DriverMapMarker();
  marker.markerInfo = {
    tripInstId: 9999,
    routes: [],
  } as DriverMapMarkerInfo;

  const result$ = service.shouldHideOption(
    option,
    marker.markerInfo.tripInstId,
    marker
  );
  const expected$ = cold("(a|)", { a: true });
  expect(result$).toBeObservable(expected$);
});
```

---

### 4. Template Testing

---

#### 4.0 Template Tests are for HTML

**Do** restrict template tests to testing the logic in the template HTML

**Why?** Unit Tests are for testing the code logic, while Template Tests are to ensure
the template HTML renders correctly based on the state of the Component.

**Do** confine template tests to their own `describe` block.

**Why?** To avoid confusion and better organize tests and test results, Unit Tests and
Template Tests should exist within their own `describe` blocks in the spec file.

> Example

```typescript
describe("SampleComponent", () => {
  let component: SampleComponent;
  let fixture: ComponentFixture<SampleComponent>;

  describe("Unit Tests", () => {
    // unit tests for the component
  });

  describe("Template Tests", () => {
    let page: TestPage;

    beforeEach(() => {
      fixture = TestBed.createComponent(SampleComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      page = new TestPage(fixture);
    });

    // tests for Template functionality
  });
});
```

---

#### 4.1 Tag elements with `data-test`

**Do** add a `data-test` attribute to elements that will be accessed for testing

**Why?** Since the internal structure of the Template can change, providing a specific identifiable attribute makes it easy to find the element in the HTML.

**Avoid** using `id` to identify testable elements

**Why?** Each `id` must be unique on a page. Since components can be reused in the same page, using an `id` can lead to conflicts.

> Example

```html
<div class="pnd-markerInfo">
  <div class="pnd-markerInfo__row">
    <div
      data-test="assigned-pickup-marker-info-header"
      class="pnd-markerInfo__chip space-around"
      [style.background-color]="markerInfo?.color"
    ></div>
  </div>
</div>
```

---

#### 4.2 TestPage Object

**Do** use TestPage object for accessing rendered elements

**Why?** Provides a standard and consistant way for accessing elements. If the structure of the HTML changes, the tests should still work.

**Do** use the `MockTestPage` class as a base for specific TestPage classes.

**Why?** The `MockTestPage` base class provides common functions for setting up the test page and interacting with elements on the page.

See [Use _page_ object](https://angular.io/guide/testing-components-scenarios#use-a-page-object) in Angular documentation

> Example

```html
<div class="sample">
  <ng-container *ngIf="wasInitCalled">
    <h1 data-test="sample-title">{{title}}</h1>
    <ul data-test="sample-list">
      <li
        *ngFor="let item of items$ | async; index as i"
        [attr.data-test]="'sample-list-item-'+i"
      >
        <span class="sample-list-item">{{item.name}}</span>
      </li>
    </ul>
  </ng-container>
</div>
```

```typescript
class TestPage extends MockTestPage<SampleComponent> {
  get title(): HTMLElement {
    return this.query<HTMLElement>('[data-test="sample-title"]');
  }

  get items(): HTMLElement {
    return this.query<HTMLElement>('[data-test="sample-list"]');
  }
}

describe("SomeComponent", () => {
  // ...

  describe("Template Tests", () => {
    let page: TestPage;

    beforeEach(() => {
      // ngOnInit will now be a spy, and calling it won't execute it
      fixture = TestBed.createComponent(SampleComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      page = new TestPage(fixture);
    });

    it("should set the title", () => {
      component.title = "mock title";
      fixture.detectChanges();

      expect(page.title).toHaveText("mock title");
    });
  });

  // ...
});
```

---

### 6. Unit Test File Structure

---

#### 6.0 Use a `describe` Block for Each Function

**Do** use a `describe` block for each function being tested.

**Why?** For clarity and to ensure that specific test cases for a function are grouped together, each `it` test for a function should be within a `describe` block named after the function being tested. This also makes the test result report easier to read.

> Example

```typescript
describe("SampleComponent", () => {
  describe("ngOnInit", () => {
    it("should subscribe to events", () => {
      // ...
    });

    it("should register with services", () => {
      // ...
    });
  });

  decribe("subscribeToEvents", () => {
    it("should do nothing if value is false", () => {
      // ...
    });

    it("should call subscribe on each handler", () => {
      // ...
    });
  });
});
```

---

#### 6.1 Organize into Unit Test and Template Test blocks

**Do** wrap all unit tests in a 'Unit Tests' describe block, and template tests in a 'Template Tests' describe block.

**Why?** Keeping Unit Tests and Template Tests in distinct describe blocks helps organize tests and makes it easier to read the output of the tests.

If the file contains only Unit Tests (such as in a Service spec file), the Unit Test block can be removed.

> Example

```typescript
describe("SampleService", () => {
  beforeEach(() => {
    // setup for tests
  });

  // NOTE: we can omit the 'Unit Test' block since the file only contains
  // unit tests
  describe("someFunction", () => {
    it("should do the thing", () => {
      // ...
    });
  });
});
```

```typescript
describe("SampleComponent", () => {
  beforeEach(() => {
    // setup common for all tests
  });

  describe("Unit Tests", () => {
    beforeEach(() => {
      // setup for unit tests
    });

    describe("someFunction", () => {
      it("should do the thing", () => {
        // ...
      });
    });
  });

  describe("Template Tests", () => {
    beforeEach(() => {
      // setup for template tests
    });

    it("should display the thing", () => {
      // ...
    });
  });
});
```

---

### 7. Code Coverage

---

#### 7.0 Check Coverage Report

**Do** generate a test coverage report

**Why?** Coverage reports detail what parts of the code are being executed by the tests. Ideally, every code path in the application will be executed by at least one test. Practically, ensure that the most common and error-prone code is tested.

```
> npm run test:coveage
```

This will run the tests and generat a report in the `coverage/html` folder at the root of the workspace. To view the results, open `index.html` in a browser.

The coverage report can also bee viewed in [Team City](https://teamcity.xpo.com/viewType.html?buildTypeId=Freight_AngularJS_Version8_PrBuilds_PndPrBuildWithCypress&tab=buildTypeStatusDiv&branch_Freight_AngularJS_Version8_PrBuilds=__all_branches__) under the "Code Coverage" tab for a given build.

#### 7.1 Add Test to Cover Bugs

**Do** add a new unit test to cover the condition when a bug is found.

**Why?** When a bug is reported and fixed, it usually means there was a hole in the unit test coverage. Part of fixing a bug is adding tests to ensure that particular bug scenario will not happen again.
