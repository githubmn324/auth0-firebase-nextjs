import React, { useState } from 'react';
import { Row, Col } from 'reactstrap';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client';

import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Highlight from '../components/Highlight';
import { Button } from 'reactstrap';

// firebase
import { cloudStorage, signInFirebase, signOutFirebase } from '../Firebase/firebase'
// cloud storage
import { ref, uploadBytes, getDownloadURL, updateMetadata, getMetadata, uploadString, deleteObject } from "firebase/storage";
// The ID of your GCS bucket & file
const bucketName = "kaigofika-poc01.appspot.com";
// const fileName = 'test01.txt';
// const imageName = "image_1.png";
// const dogImageName = "dogimage01.png"

function CloudStorage() {
  const { user, isLoading } = useUser();
  const [image, setImage] = useState(null);
  const [uploadImage, setUploadImage] = useState();
  const [getImage, setGetImage] = useState();
  const [newOrgId, setNewOrgId] = useState();

  // 画像の取得
  const handleGetImageChange = (e) => {
    console.log(e.target.value)
    setGetImage(e.target.value);
  };
  const getTest01 = async(e) => {
    e.preventDefault();
    await signInFirebase();
    const gsReference = ref(
      cloudStorage,
      `gs://${bucketName}/${getImage}`
    );
    getDownloadURL(gsReference).then((url) => {
      console.log({
        method: "getDownloadURL",
        url: url
      })
      setImage(url);
    }).catch((err) => {
      signOutFirebase()
      console.log(err)
    });
    signOutFirebase();
  }

  // オンボーディング時のフォルダ階層追加
  const handleOrgIdChange = (e) => {
    console.log(e)
    setNewOrgId(e.target.value);
  }
  const createFolder = async(e) => {
    try {
      e.preventDefault();
      await signInFirebase();
      const initFile = '.initFile'
      const initFileRef = ref(
        cloudStorage,
        `gs://${bucketName}/collection001/${newOrgId}/${initFile}`
      );
      await uploadString(initFileRef, "initial")
      await deleteObject(initFileRef)
      signOutFirebase();
    }catch(error){
      signOutFirebase();
      console.log(error);
    }
  }
  // Auth0側のorganization追加
  const createOrganization=(e)=>{
    const org = {
      "name": "organization-1",
      "display_name": "Acme Users",
      "branding": {
        "logo_url": "",
        "colors": {
          "primary": "",
          "page_background": ""
        }
      },
      "metadata": {},
      "enabled_connections": [
        "object"
      ]
    }
    setNewOrgId()
  }
  
  // 画像の保存
  const handleChange = (e) => {
    setUploadImage(e.target.files[0]);
  };
  const handleSubmit = (e) => {
    try {
      e.preventDefault();
      console.log(uploadImage);
      const uploadImageRef = ref(cloudStorage, uploadImage.name);
      uploadBytes(uploadImageRef, image).then((res) => {
        console.log({
          method: "handleSubmit",
          message: "Uploaded a file!",
          res: res
        });
      });
      updateMetadata(uploadImageRef, metaData).then((metadata) => {
          console.log({
            method: "updateMetadata",
            metadata: metadata
          })
        }).catch((error)=> console.log(error));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      {user && (
        <>
          <Row className="align-items-center profile-header mb-5 text-center text-md-left" data-testid="profile">
            <Col md={2}>
              <img
                src={user.picture}
                alt="Profile"
                className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
                decode="async"
                data-testid="profile-picture"
              />
            </Col>
            <Col md>
              <h2 data-testid="profile-name">{user.name}</h2>
              <p className="lead text-muted" data-testid="profile-email">
                {user.email}
              </p>
            </Col>
          </Row>
          <Row data-testid="profile-json">
            <Highlight>{JSON.stringify(user, null, 2)}</Highlight>
          </Row>
          <Row className="align-items-center profile-header mb-5 text-center text-md-left">
          <form onSubmit={handleSubmit}>
              <input type="file" onChange={handleChange} />
              <button className="button">Upload</button>
            </form>
          </Row>         
          <Row className="align-items-center profile-header mb-5 text-center text-md-left">
            <form onSubmit={getTest01}>
              <input type="text" onChange={handleGetImageChange} />
              <button className="button">取得</button>
            </form>
            <p>.</p>
            <img src={image} alt="" />
            <Highlight>{image}</Highlight>
          </Row>
          <Row>
            <form onSubmit={createFolder}>
              <input type="text" onChange={handleOrgIdChange} />
              <button className="button">組織追加</button>
            </form>
          </Row>
        </>
      )}
    </>
  );
}

export default withPageAuthRequired(CloudStorage, {
  onRedirecting: () => <Loading />,
  onError: error => <ErrorMessage>{error.message}</ErrorMessage>
});
