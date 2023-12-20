import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

function App() {
  const [log1, setLogs1] = useState([]);
  const [log2, setLogs2] = useState([]);
  const [isInBai1, setIsInBai1] = useState(false);
  const [isInBai2, setIsInBai2] = useState(false);
  const [newCard, setNewCard] = useState({
    CardID: '',
    BienSoXe: '',
    ChuXe: ''
  })
  const [cardList, setCardList] = useState([]);

  const addNewCard = () => {
    if (!newCard.CardID || !newCard.BienSoXe || !newCard.ChuXe) {
      // Nếu có ít nhất một trường bị bỏ trống, hiển thị thông báo
      alert('Vui lòng nhập đầy đủ thông tin thẻ');
      return; // Ngăn việc tiếp tục thực hiện thêm thẻ
    }
    // Gửi dữ liệu thẻ mới lên phía backend 
    axios.post('http://localhost:1234/addnewcard', newCard)
      .then((response) => {
        // Xử lý khi thêm thẻ thành công
        console.log('Thêm thẻ thành công');
        const updatedCardList = [...cardList];
        updatedCardList.push(newCard);
        setCardList(updatedCardList);
        setNewCard({
          CardID: '',
          BienSoXe: '',
          ChuXe: '',
        });
      })
      .catch((error) => {
        // Xử lý khi có lỗi
        console.error('Lỗi khi thêm thẻ:', error);
      });
};

const deleteCard = () => {
  // Gửi yêu cầu DELETE để xóa thẻ
  if (!newCard.CardID) {
    // Nếu không có thẻ nào được chọn, hiển thị thông báo
    alert('Vui lòng nhập thẻ cần xóa');
    return; // Ngăn việc tiếp tục thực hiện xóa thẻ
  }

  axios.delete(`http://localhost:1234/remove/${newCard.CardID}`)
    .then((response) => {
      // Xử lý khi xóa thẻ thành công
      console.log('Xóa thẻ thành công');
      const updatedCardList = cardList.filter((card) => card.CardID !== newCard.CardID);
      // Cập nhật state cardList với danh sách mới
      setCardList(updatedCardList);
      setNewCard({
        CardID: '',
        BienSoXe: '',
        ChuXe: '',
      });
    })
    .catch((error) => {
      // Xử lý khi có lỗi
      console.error('Lỗi khi xóa thẻ:', error);
    });
};

useEffect(() => {
  axios.get("http://localhost:1234/get/17921521375").then((response) => {
    const logs = response.data;
    setLogs1(logs);
    if (logs.length > 0) {
      setIsInBai1(logs[logs.length - 1].ThaoTac === "Check-in");
    }
  });
  axios.get("http://localhost:1234/get/213413173").then((response) => {
    const logs = response.data;
    setLogs2(logs);
    if (logs.length > 0) {
      setIsInBai2(logs[logs.length - 1].ThaoTac === "Check-in");
    }
  });
  axios.get('http://localhost:1234/getCardInfo')
    .then((response) => {
      setCardList(response.data);
    })
    .catch((error) => {
      console.error('Lỗi khi lấy danh sách thẻ:', error);
    });
}, []);

return (
  <div className="App">
    <div className="Title"> QUẢN LÍ BÃI XE THÔNG MINH</div>
    <div className="Main">
      <div className="card" style={{ width: "30rem", height: "auto" ,backgroundColor: "#f2f2f2"}}>
        <p className="title1">Camera 1:</p>
        <img
          src="https://media1.nguoiduatin.vn/media/nguyen-ngoc-hoai-thanh/2020/07/13/xon-xao-xe-may-bien-so-999-99-duoc-rao-ban-900-trieu-dong2.jpg"
          className="card-img-top"
          alt="Hình ảnh"
          style={{ width: "100%", height: "250px", objectFit: "cover" }}
        ></img>
        <div className="card-body">
          <p className="title1">Biển số xe</p>
          <p className="text1">50N199999</p>
          <p className="title1">Tình trạng</p>
          <p className="text2">{isInBai1 ? "Trong bãi" : "Ngoài bãi"}</p>
          <p className="title1">Nhật ký hoạt động</p>
          <div className="api-data">
            {log1.map((item, index) => (
              <div key={index} className="api-item">
                <p className="api-title">
                  {format(new Date(item.ThoiGianQuetThe), "yyyy-MM-dd HH:mm:ss")} - {item.ThaoTac}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card" style={{ width: "30rem", height: "auto" ,backgroundColor: "#f2f2f2"}}>
        <p className="title1">Camera 2: </p>
        <img
          src="https://luatduonggia.vn/wp-content/uploads/2022/03/Bien-so-xe-49-la-o-dau-Bien-so-Lam-Dong-theo-tung-khu-vuc.jpg"
          className="card-img-top"
          alt="Hình ảnh"
          style={{ width: "100%", height: "250px", objectFit: "cover" }}
        ></img>
        <div className="card-body">
          <p className="title1">Biển số xe</p>
          <p className="text1">49E122222</p>
          <p className="title1">Tình trạng</p>
          <p className="text2">{isInBai2 ? "Trong bãi" : "Ngoài bãi"}</p>
          <p className="title1">Nhật ký hoạt động</p>
          <div className="api-data">
            {log2.map((item, index) => (
              <div key={index} className="api-item">
                <p className="api-title">
                  {format(new Date(item.ThoiGianQuetThe), "yyyy-MM-dd HH:mm:ss")} - {item.ThaoTac}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="Card-Management">
        <h2>QUẢN LÍ THẺ</h2>
        <div className="input-section">
          <input
            type="text"
            placeholder="Mã số thẻ"
            value={newCard.CardID}
            onChange={(e) => setNewCard({ ...newCard, CardID: e.target.value })}
            className="large-input"
          />
          <input
            type="text"
            placeholder="Biển số xe"
            value={newCard.BienSoXe}
            onChange={(e) => setNewCard({ ...newCard, BienSoXe: e.target.value })}
            className="large-input"
          />
          <input
            type="text"
            placeholder="Chủ xe"
            value={newCard.ChuXe}
            onChange={(e) => setNewCard({ ...newCard, ChuXe: e.target.value })}
            className="large-input"
          />
        </div>
        <div className="button-section">
          <button onClick={addNewCard} className="large-button">Thêm</button>
          <button onClick={deleteCard} className="large-button">Xóa</button>
        </div>
        <div className="card-list">
          <h2>Danh sách thẻ</h2>
          <table>
            <thead>
              <tr>
                <th>CardID</th>
                <th>Biển số xe</th>
                <th>Chủ xe</th>
              </tr>
            </thead>
            <tbody>
              {cardList.map((card) => (
                <tr key={card.CardID}>
                  <td>{card.CardID}</td>
                  <td>{card.BienSoXe}</td>
                  <td>{card.ChuXe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
}

export default App;