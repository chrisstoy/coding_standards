# Change Process Flow

Change Flow describes how a change goes from requirement to production.  

For example, take a new feature `FEAT`.  

It begins its life as a requirement defined during a planning session. A Jira ticket is created and placed in the backlog.  

`FEAT` is assigned to a developer and assigned to be completed for a particular release (eg, `v1.2-dev`)

The developer creates a feature branch from `master`, with branch named after the Jira ticket id.

Developer works locally to implement `FEAT`, writing code and running tests. Once they complete development, code changes are pushed to the feature branch and an Merge Request is created to merge that branch back into the `master` branch.

One or more other developers review the change and, when approved, the branch is merged into `master` and becomes the new bases for which all other feature branches are created.

After all/most features for a release are completed and merged into `master`, a new version  of `stage` is created by merging `master` into the `stage` branch (`v1.2-beta`).

Staging now contains our new `FEAT` and is ready for final testing.  

Once Staging has been tested and approved for final release, it is then deployed to `production` (`v1.2`). 

The same version of Staging can also be deployed to a `demo` environment (`v1.2-demo`), which is the same as `production` but without the production data.

## Product Releases
The Product is the thing being developed and put out into the world for End Users. It consists of a set of Artifacts and the Environment in which those artifacts are deployed.  These can be as simple as a single html file to a complex set of microservices, databases, mobile applications,documentation, and in-person instruction.  


## Environments
Different environments need to be establilshed in order to implement this process:

 - **local** - place where a developer works on new features (ie, a local laptop)
 - **sandbox** - a shared environment that can be updated for testing code
 - **dev** - "latest and greatest" that represents the current state of development 
 - **staging/test/qa** - version of the system that is undergoing final tests before release to production
 - **production** - user-facing instance of the application
 - **demo** - same as production, but with a non-production set of data. used for demonstration purposes.

Each environment is a self-contained instance of the entire suite of artifacts that make up a usable version of the product. Artifacts may be shared between environments (for example, a shared database or Docker image.)


## Branches

A Branch is specific to the version control system used to manage the elements used to generate Artifacts for a Release.  