const {getAnnouncements,getAnnouncement} = require("../controllers/announcements");
const Announcement = require("../models/Announcement");

jest.mock("../models/Announcement");

describe("getAnnouncements", () => {
  let req, res, next;

  // Reusable mock query chain
  const buildQueryChain = () => {
    const chain = {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
    return chain;
  };

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  // ─────────────────────────────────────────────
  // 1. Basic success — no select, no sort, no pagination (uses defaults)
  // ─────────────────────────────────────────────
  it("should return 200 with announcements using default sort and pagination", async () => {
    req = { query: {} };

    const mockAnnouncements = [{ id: "1", title: "Hello" }];
    const chain = buildQueryChain();
    chain.limit = jest.fn().mockResolvedValue(mockAnnouncements);
    
    Announcement.find.mockReturnValue(chain);
    Announcement.countDocuments.mockResolvedValue(1);

    await getAnnouncements(req, res, next);

    expect(Announcement.find).toHaveBeenCalledWith({});
    expect(chain.populate).toHaveBeenCalledWith({ path: "author", select: "name email" });
    expect(chain.sort).toHaveBeenCalledWith("-createdAt"); // default sort branch
    expect(chain.select).not.toHaveBeenCalled();          // no select branch
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        count: 1,
        data: mockAnnouncements,
      })
    );
  });

  // ─────────────────────────────────────────────
  // 2. select branch — req.query.select present
  // ─────────────────────────────────────────────
  it("should apply select fields when req.query.select is provided", async () => {
    req = { query: { select: "title,content" } };

    const mockAnnouncements = [{ id: "1", title: "Hi" }];
    const chain = buildQueryChain();
    chain.limit = jest.fn().mockResolvedValue(mockAnnouncements);

    Announcement.find.mockReturnValue(chain);
    Announcement.countDocuments.mockResolvedValue(1);

    await getAnnouncements(req, res, next);

    expect(chain.select).toHaveBeenCalledWith("title content"); // comma → space
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ─────────────────────────────────────────────
  // 3. sort branch — req.query.sort present
  // ─────────────────────────────────────────────
  it("should apply custom sort when req.query.sort is provided", async () => {
    req = { query: { sort: "title,-createdAt" } };

    const mockAnnouncements = [];
    const chain = buildQueryChain();
    chain.limit = jest.fn().mockResolvedValue(mockAnnouncements);

    Announcement.find.mockReturnValue(chain);
    Announcement.countDocuments.mockResolvedValue(0);

    await getAnnouncements(req, res, next);

    expect(chain.sort).toHaveBeenCalledWith("title -createdAt"); // comma → space
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ─────────────────────────────────────────────
  // 4. pagination.next branch — endIndex < total
  // ─────────────────────────────────────────────
  it("should include pagination.next when there are more pages ahead", async () => {
    req = { query: { page: "1", limit: "2" } };

    const mockAnnouncements = [{ id: "1" }, { id: "2" }];
    const chain = buildQueryChain();
    chain.limit = jest.fn().mockResolvedValue(mockAnnouncements);

    Announcement.find.mockReturnValue(chain);
    Announcement.countDocuments.mockResolvedValue(10); // endIndex(2) < total(10)

    await getAnnouncements(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({ next: { page: 2, limit: 2 } }),
      })
    );
  });

  // ─────────────────────────────────────────────
  // 5. pagination.prev branch — startIndex > 0
  // ─────────────────────────────────────────────
  it("should include pagination.prev when not on the first page", async () => {
    req = { query: { page: "3", limit: "2" } };

    const mockAnnouncements = [{ id: "5" }, { id: "6" }];
    const chain = buildQueryChain();
    chain.limit = jest.fn().mockResolvedValue(mockAnnouncements);

    Announcement.find.mockReturnValue(chain);
    Announcement.countDocuments.mockResolvedValue(10); // startIndex(4) > 0

    await getAnnouncements(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({ prev: { page: 2, limit: 2 } }),
      })
    );
  });

  // ─────────────────────────────────────────────
  // 6. Both next AND prev — middle page
  // ─────────────────────────────────────────────
  it("should include both pagination.next and prev when on a middle page", async () => {
    req = { query: { page: "2", limit: "3" } };

    const mockAnnouncements = [{ id: "4" }, { id: "5" }, { id: "6" }];
    const chain = buildQueryChain();
    chain.limit = jest.fn().mockResolvedValue(mockAnnouncements);

    Announcement.find.mockReturnValue(chain);
    Announcement.countDocuments.mockResolvedValue(20);

    await getAnnouncements(req, res, next);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.pagination.next).toEqual({ page: 3, limit: 3 });
    expect(jsonArg.pagination.prev).toEqual({ page: 1, limit: 3 });
  });

  // ─────────────────────────────────────────────
  // 7. Filter operators branch — gt, gte, lt, lte, in conversion
  // ─────────────────────────────────────────────
  it("should convert filter operators (gt/gte/lt/lte/in) to MongoDB syntax", async () => {
    req = { query: { views: { gt: "5", lte: "100" } } };

    const chain = buildQueryChain();
    chain.limit = jest.fn().mockResolvedValue([]);

    Announcement.find.mockReturnValue(chain);
    Announcement.countDocuments.mockResolvedValue(0);

    await getAnnouncements(req, res, next);

    // Argument passed to Announcement.find should have $gt / $lte
    const findArg = Announcement.find.mock.calls[0][0];
    expect(findArg).toEqual({ views: { $gt: "5", $lte: "100" } });
  });

  // ─────────────────────────────────────────────
  // 8. removeFields branch — select/sort/page/limit must be stripped from filter
  // ─────────────────────────────────────────────
  it("should exclude select, sort, page, limit from the find query", async () => {
    req = { query: { select: "title", sort: "title", page: "1", limit: "5", category: "news" } };

    const chain = buildQueryChain();
    chain.limit = jest.fn().mockResolvedValue([]);

    Announcement.find.mockReturnValue(chain);
    Announcement.countDocuments.mockResolvedValue(0);

    await getAnnouncements(req, res, next);

    const findArg = Announcement.find.mock.calls[0][0];
    // Only 'category' should remain; reserved fields must be stripped
    expect(findArg).toEqual({ category: "news" });
    expect(findArg).not.toHaveProperty("select");
    expect(findArg).not.toHaveProperty("sort");
    expect(findArg).not.toHaveProperty("page");
    expect(findArg).not.toHaveProperty("limit");
  });

  // ─────────────────────────────────────────────
  // 9. Error branch — catch block returns 500
  // ─────────────────────────────────────────────
  it("should return 500 when Announcement.find throws an error", async () => {
    req = { query: {} };

    const chain = buildQueryChain();
    chain.limit = jest.fn().mockRejectedValue(new Error("DB error"));

    Announcement.find.mockReturnValue(chain);
    Announcement.countDocuments.mockResolvedValue(0);

    await getAnnouncements(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Cannot get announcements",
    });
  });

  // ─────────────────────────────────────────────
  // 10. Error branch — countDocuments throws
  // ─────────────────────────────────────────────
  it("should return 500 when countDocuments throws an error", async () => {
    req = { query: {} };

    const chain = buildQueryChain();
    Announcement.find.mockReturnValue(chain);
    Announcement.countDocuments.mockRejectedValue(new Error("Count failed"));

    await getAnnouncements(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Cannot get announcements",
    });
  });
});


describe("getAnnouncement", () => {
  let req, res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  // 1. กรณีหาเจอ (Success)
  it("should return 200 and the announcement if it exists", async () => {
    const mockId = "60d0fe4f5311236168a109ca";
    req = { params: { id: mockId } };

    const mockAnnouncement = {
      _id: mockId,
      title: "Special News",
      author: { name: "John Doe", email: "john@test.com" }
    };

    Announcement.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockAnnouncement)
    });

    await getAnnouncement(req, res, next);

    expect(Announcement.findById).toHaveBeenCalledWith(mockId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockAnnouncement
    });
  });

  it("should return 404 if the announcement does not exist", async () => {
    req = { params: { id: "non-existent-id" } };

    Announcement.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null)
    });

    await getAnnouncement(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `No announcement with id ${req.params.id}`
    });
  });

  it("should return 500 if there is a database error", async () => {
    req = { params: { id: "some-id" } };

    Announcement.findById.mockReturnValue({
      populate: jest.fn().mockRejectedValue(new Error("Database connection lost"))
    });

    await getAnnouncement(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Cannot get announcement"
    });
  });
});