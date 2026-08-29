# @next-box/breadcrumb

A library for implementing a breadcrumb in React applications.

[![npm version](https://badge.fury.io/js/%40dollygrip%2Fbreadcrumb.svg)](https://badge.fury.io/js/%40dollygrip%2Fbreadcrumb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Implementing and managing a breadcrumb for an application can be time-consuming and complicated. This library tries to simplify the implementation and management through a set of configurable rules that run against a browser route. Rules support regular expression named capture groups, dynamic data fetching, and more.

Rules can be structured per browser route or across browser routes via each rule's regex pattern, whatever makes sense for an application. All rules will be run against each browser route and each matching rule will be applied to a route in the order they are defined.

The library tracks a user's journey through an application and saves the data to session storage. It exposes the data via a React hook, which a consumer can pass to their own breadcrumb component to render. To track the user's journey between sessions, the library supports exporting and importing the breadcrumb history via a React context.

## Installation

```shell
# terminal
npm add @next-box/breadcrumb
```

## Usage

// TODO

## Changelog

Check out the [features, fixes and more](../../CHANGELOG.md) that go into each major, minor and patch version.

## License

@next-box/breadcrumb is [MIT Licensed](LICENSE).
