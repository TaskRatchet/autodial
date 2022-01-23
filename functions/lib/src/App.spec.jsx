/**
 * @jest-environment jsdom
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React from "react";
import { waitFor } from "@testing-library/react";
import App from "./App";
import { getParams } from "./lib/browser";
import { deleteUser, setUserAuth } from "./lib/database";
import { getGoal, getGoals, getGoalsVerbose, setNow, parseDate, r, withMutedReactQueryLogger, } from "./lib";
import { makeGoal } from "../functions/src/test/helpers";
jest.mock("./lib/browser");
jest.mock("./lib/database");
jest.mock("./lib/firebase");
jest.mock("./lib/beeminder");
var mockGetParams = getParams;
var mockSetUserAuth = setUserAuth;
var mockGetGoals = getGoals;
var mockGetGoalsVerbose = getGoalsVerbose;
var mockGetGoal = getGoal;
function loadParams(params) {
    mockGetParams.mockReturnValue(new URLSearchParams(params));
}
function loadGoals(goals) {
    var goals_ = goals.map(function (g, i) { return makeGoal(__assign({ slug: "slug_".concat(i), runits: "d", fineprint: "#autodial", aggday: "sum", roadall: [
            [parseDate("20090210"), 0, null],
            [parseDate("20090315"), null, g.rate === undefined ? 1 : g.rate],
        ] }, g)); });
    mockGetGoal.mockImplementation(function (slug) {
        return __assign({ datapoints: [] }, goals_.find(function (g) { return g.slug === slug; }));
    });
    mockGetGoalsVerbose.mockResolvedValue(goals_.map(function (g) { return (__assign({ datapoints: [] }, g)); }));
    mockGetGoals.mockResolvedValue(goals_);
}
describe("Home page", function () {
    beforeEach(function () {
        mockGetParams.mockReturnValue(new URLSearchParams(""));
        mockSetUserAuth.mockResolvedValue(null);
        loadGoals([{ slug: "the_slug" }]);
        loadParams("?access_token=abc123&username=alice");
    });
    it("has authenticate button", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadParams("");
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("Enable Autodialer")).toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("links authenticate link", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadParams("");
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("Enable Autodialer")).toHaveAttribute("href", expect.stringContaining("https://www.beeminder.com/apps/authorize"));
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe("with mocked env", function () {
        var OLD_ENV = process.env;
        beforeEach(function () {
            jest.resetModules();
            process.env = __assign({}, OLD_ENV);
        });
        afterAll(function () {
            process.env = OLD_ENV;
        });
        it("includes client id in authenticate url", function () { return __awaiter(void 0, void 0, void 0, function () {
            var getByText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loadParams("");
                        process.env.REACT_APP_BM_CLIENT_ID = "the_client_id";
                        return [4 /*yield*/, r(<App />)];
                    case 1:
                        getByText = (_a.sent()).getByText;
                        return [4 /*yield*/, waitFor(function () {
                                expect(getByText("Enable Autodialer"))
                                    .toHaveAttribute("href", expect.stringContaining("the_client_id"));
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("includes client secret in authenticate url", function () { return __awaiter(void 0, void 0, void 0, function () {
            var getByText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loadParams("");
                        process.env.REACT_APP_APP_URL = "http://the_app_url";
                        return [4 /*yield*/, r(<App />)];
                    case 1:
                        getByText = (_a.sent()).getByText;
                        return [4 /*yield*/, waitFor(function () {
                                expect(getByText("Enable Autodialer"))
                                    .toHaveAttribute("href", expect.stringContaining(encodeURIComponent("http://the_app_url")));
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    it("persists credentials", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, r(<App />)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, waitFor(function () {
                            expect(setUserAuth).toBeCalledWith("alice", "abc123");
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("does not persist credentials if none passed", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadParams("");
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    _a.sent();
                    expect(setUserAuth).not.toBeCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it("gets user goals", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, r(<App />)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, waitFor(function () {
                            expect(getGoalsVerbose).toBeCalledWith("alice", "abc123");
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("displays Beeminder error message", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, withMutedReactQueryLogger(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var getByText;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    mockGetGoalsVerbose.mockRejectedValue(new Error("the_error_message"));
                                    return [4 /*yield*/, r(<App />)];
                                case 1:
                                    getByText = (_a.sent()).getByText;
                                    return [4 /*yield*/, waitFor(function () {
                                            expect(getByText("the_error_message")).toBeInTheDocument();
                                        })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("does not set user auth if bm error", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, withMutedReactQueryLogger(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var getByText;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    mockGetGoalsVerbose.mockRejectedValue(new Error("the_error_message"));
                                    return [4 /*yield*/, r(<App />)];
                                case 1:
                                    getByText = (_a.sent()).getByText;
                                    return [4 /*yield*/, waitFor(function () {
                                            expect(getByText("the_error_message")).toBeInTheDocument();
                                        })];
                                case 2:
                                    _a.sent();
                                    expect(setUserAuth).not.toBeCalled();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("displays beeminder username", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("alice")).toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("does not display beeminder username if auth failure", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, withMutedReactQueryLogger(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, getByText, queryByText;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    mockGetGoalsVerbose.mockRejectedValue(new Error("the_error_message"));
                                    return [4 /*yield*/, r(<App />)];
                                case 1:
                                    _a = _b.sent(), getByText = _a.getByText, queryByText = _a.queryByText;
                                    return [4 /*yield*/, waitFor(function () {
                                            expect(getByText("the_error_message")).toBeInTheDocument();
                                        })];
                                case 2:
                                    _b.sent();
                                    expect(queryByText("alice")).not.toBeInTheDocument();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("lists goal slugs", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadGoals([{ slug: "the_slug" }]);
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("the_slug")).toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("lists slugs alphabetically", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadGoals([
                        { slug: "b_slug" },
                        { slug: "a_slug" },
                    ]);
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            var _a, _b, _c, _d;
                            var a = getByText("a_slug");
                            var el = (_d = (_c = (_b = (_a = a.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.nextSibling) === null || _c === void 0 ? void 0 : _c.firstChild) === null || _d === void 0 ? void 0 : _d.textContent;
                            expect(el).toEqual("b_slug");
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("hides goals table if user not authenticated", function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadParams("");
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    queryByText = (_a.sent()).queryByText;
                    expect(queryByText("Here are your goals:")).not.toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    it("displays min value", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadGoals([
                        { slug: "the_slug", rate: 3, fineprint: "#autodialMin=1.5" },
                    ]);
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("1.5/d")).toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("displays negative infinity if no min set for enabled goal", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadGoals([
                        { slug: "the_slug", fineprint: "#autodial" },
                    ]);
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("Negative Infinity")).toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("does not display min if autodial not enabled for goal", function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadGoals([
                        { slug: "the_slug" },
                    ]);
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    queryByText = (_a.sent()).queryByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(queryByText("Negative Infinity")).not.toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("displays positive value", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadGoals([
                        { slug: "the_slug", rate: 3, fineprint: "#autodialMax=1" },
                    ]);
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("1/d")).toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("displays positive infinity if no max set for enabled goal", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadGoals([
                        { slug: "the_slug", fineprint: "#autodial" },
                    ]);
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("Positive Infinity")).toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("removes login button when data loads successfully", function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, r(<App />)];
                case 1:
                    queryByText = (_a.sent()).queryByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(queryByText("Enable Autodialer")).not.toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("includes disable button", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("Disable Autodialer")).toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("links disable button", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("Disable Autodialer"))
                                .toHaveAttribute("href", "/?access_token=abc123&username=alice&disable=true");
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("does not persist credentials if disabling", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadParams("?access_token=abc123&username=alice&disable=true");
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("The autodialer has been disabled for Beeminder user alice")).toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    expect(setUserAuth).not.toBeCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it("deletes database user on disable", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadParams("?access_token=abc123&username=alice&disable=true");
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, waitFor(function () {
                            expect(deleteUser).toBeCalledWith("alice");
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("does not show goals for disabled user", function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, getByText, queryByText;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    loadParams("?access_token=abc123&username=alice&disable=true");
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    _a = _b.sent(), getByText = _a.getByText, queryByText = _a.queryByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("The autodialer has been disabled for Beeminder user alice")).toBeInTheDocument();
                        })];
                case 2:
                    _b.sent();
                    expect(queryByText("Here are your goals:")).not.toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    it("displays error on disable if Beeminder auth fails", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, withMutedReactQueryLogger(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var getByText;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    loadParams("?access_token=abc123&username=alice&disable=true");
                                    mockGetGoalsVerbose.mockRejectedValue(new Error("the_error_message"));
                                    return [4 /*yield*/, r(<App />)];
                                case 1:
                                    getByText = (_a.sent()).getByText;
                                    return [4 /*yield*/, waitFor(function () {
                                            expect(getByText("Unable to disable autodialer for Beeminder user alice: " +
                                                "Beeminder authentication failed.")).toBeInTheDocument();
                                        })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("does not display disable success message if auth fails", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, withMutedReactQueryLogger(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, getByText, queryByText;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    loadParams("?access_token=abc123&username=alice&disable=true");
                                    mockGetGoalsVerbose.mockRejectedValue(new Error("the_error_message"));
                                    return [4 /*yield*/, r(<App />)];
                                case 1:
                                    _a = _b.sent(), getByText = _a.getByText, queryByText = _a.queryByText;
                                    expect(queryByText("The autodialer has been disabled for Beeminder user alice")).not.toBeInTheDocument();
                                    return [4 /*yield*/, waitFor(function () {
                                            expect(getByText("Unable to disable autodialer for Beeminder user alice: " +
                                                "Beeminder authentication failed.")).toBeInTheDocument();
                                        })];
                                case 2:
                                    _b.sent();
                                    expect(queryByText("The autodialer has been disabled for Beeminder user alice")).not.toBeInTheDocument();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("does not get goals if no username", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadParams("");
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    _a.sent();
                    expect(getGoals).not.toBeCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it("only shows enabled goals", function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, queryByText, getByText;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    loadGoals([
                        { slug: "slug_a", fineprint: "" },
                        { slug: "slug_b", fineprint: "#autodial" },
                    ]);
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    _a = _b.sent(), queryByText = _a.queryByText, getByText = _a.getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("slug_b")).toBeInTheDocument();
                        })];
                case 2:
                    _b.sent();
                    expect(queryByText("slug_a")).not.toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    it("links slugs", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadGoals([{ slug: "the_slug" }]);
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("the_slug")).toHaveAttribute("href", "https://beeminder.com/alice/the_slug");
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("links username", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("alice")).toHaveAttribute("href", "https://beeminder.com/alice");
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("includes historical average", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setNow(2009, 3, 4);
                    loadGoals([{
                            slug: "the_slug",
                            rate: 3,
                            roadall: [
                                [parseDate("20090210"), 0, null],
                                [parseDate("20090315"), null, 3],
                            ],
                            datapoints: [
                                { value: 0, daystamp: "20090210" },
                                {
                                    value: 30,
                                    daystamp: "20090213",
                                },
                            ],
                        },
                    ]);
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("1/d")).toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("reports average in terms of runits", function () { return __awaiter(void 0, void 0, void 0, function () {
        var getByText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setNow(2009, 3, 4);
                    loadGoals([{
                            slug: "the_slug",
                            rate: 3,
                            runits: "m",
                            roadall: [
                                [parseDate("20090210"), 0, null],
                                [parseDate("20090315"), null, 1],
                            ],
                            datapoints: [
                                { value: 0, daystamp: "20090210" },
                                {
                                    value: 30,
                                    daystamp: "20090213",
                                },
                            ],
                        },
                    ]);
                    return [4 /*yield*/, r(<App />)];
                case 1:
                    getByText = (_a.sent()).getByText;
                    return [4 /*yield*/, waitFor(function () {
                            expect(getByText("30.44/m")).toBeInTheDocument();
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
// TODO:
// add route to handle de-authorizing the app from Beeminder side (will need
//   de-auth cloud function to handle post data)
