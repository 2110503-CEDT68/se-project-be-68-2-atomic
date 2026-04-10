const Announcement = require("../models/Announcement"); // ปรับ path ให้ตรงกับไฟล์ Schema ของคุณ

// 1. Get All: ดึงข้อมูลทั้งหมด (แบบย่อ) ไปแสดงหน้า List
exports.getAllAnnouncements = async (req, res) => {
  try {
    // ดึงเฉพาะประกาศที่ publish แล้ว, เรียงจากใหม่ไปเก่า, และเลือกเฉพาะฟิลด์ที่จำเป็น
    const announcements = await Announcement.find({ isPublished: true })
      .select("title picture createdAt updatedAt viewCount") // ดึงมาแค่นี้เพื่อแสดงย่อๆ
      .sort({ createdAt: -1 }); // -1 คือเรียงจากล่าสุดไปเก่าสุด

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get One: ดึงข้อมูลแบบละเอียดสำหรับอ่านเต็มๆ
exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    // ค้นหาพร้อมดึงข้อมูลคนเขียน (Populate) มาแสดงด้วย
    const announcement = await Announcement.findById(id)
      .populate("createdBy", "name username"); // สมมติว่า User มีฟิลด์ name กับ username

    if (!announcement) {
      return res.status(404).json({ success: false, message: "ไม่พบประกาศนี้" });
    }

    // (ออปชันเสริม) เพิ่มยอดวิวอัตโนมัติทุกครั้งที่มีคนกดเข้ามาอ่าน
    announcement.viewCount += 1;
    await announcement.save();

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Create: สร้างประกาศใหม่
exports.createAnnouncement = async (req, res) => {
  try {
    // สมมติว่าดึง ID คนสร้างมาจากระบบ Login (req.user) หรือรับมาจาก body
    // req.body.createdBy = req.user.id; 

    const newAnnouncement = await Announcement.create(req.body);

    res.status(201).json({
      success: true,
      message: "สร้างประกาศสำเร็จ",
      data: newAnnouncement,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 4. Edit: แก้ไขประกาศ
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    // findByIdAndUpdate จะอัปเดตฟิลด์ updatedAt ให้อัตโนมัติ
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true, // คืนค่าข้อมูลตัวใหม่ที่อัปเดตแล้วกลับมา
        runValidators: true, // ให้ตรวจ Schema Validation อีกรอบ
      }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ success: false, message: "ไม่พบประกาศนี้" });
    }

    res.status(200).json({
      success: true,
      message: "แก้ไขประกาศสำเร็จ",
      data: updatedAnnouncement, // ข้อมูลนี้จะมีฟิลด์ updatedAt ที่เป็นเวลาล่าสุดให้เอาไปโชว์
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. Delete: ลบประกาศ
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ success: false, message: "ไม่พบประกาศนี้" });
    }

    res.status(200).json({
      success: true,
      message: "ลบประกาศเรียบร้อยแล้ว",
      data: {} 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};