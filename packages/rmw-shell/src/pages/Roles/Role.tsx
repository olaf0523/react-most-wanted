import React from "react";
import { useIntl } from "react-intl";
import { Page, useQuestionsDialog } from "@ecronix/material-ui-shell";
import { useParams, useNavigate } from "react-router-dom";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Divider from "@mui/material/Divider";
import AccountBox from "@mui/icons-material/AccountBox";
import Save from "@mui/icons-material/Save";
import Delete from "@mui/icons-material/Delete";
import Lock from "@mui/icons-material/Lock";
import { GrantsListContainer } from "../../containers/GrantsList";
import Zoom from "@mui/material/Zoom";
import { SearchField, useFilter } from "@ecronix/material-ui-shell";
import { FirebaseFromContainer, FormsRole } from "@ecronix/rmw-shell";
import IconButton from "@mui/material/IconButton";
import { useAuth } from "@ecronix/base-shell";
import { getDatabase, ref, set } from "firebase/database";
import Box from "@mui/material/Box";

const path = "roles";
const singular = "role";

export function RolePage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { uid, tab = "main" } = useParams();
  const { getFilter, setSearch } = useFilter();
  const { search = {} } = getFilter(tab);
  // TODO check since it was useQuestions() which is undefined
  const { openDialog } = useQuestionsDialog();
  const { auth, isAuthGranted = () => false } = useAuth();
  const { value: searchValue = "" } = search;
  let submit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;

  const setSubmit = (s: (e: any) => void) => {
    submit = s;
  };

  const grantsPath = `role_grants/${uid}`;

  const openDeleteDialog = () => {
    openDialog({
      handleAction: async (handleClose: () => void) => {
        await set(ref(getDatabase(), `${path}/${uid}`), null);
        handleClose();
        navigate(`/${path}`);
      },
      title: intl.formatMessage({
        id: `delete_${singular}_dialog_title`,
        defaultMessage: "Delete Role?",
      }),
      message: intl.formatMessage({
        id: `delete_${singular}_dialog_message`,
        defaultMessage: "Role will be deleted permanently?",
      }),
      action: intl.formatMessage({
        id: `delete_${singular}_dialog_action`,
        defaultMessage: "DELETE ROLE",
      }),
    });
  };

  return (
    <Page
      onBackClick={() => {
        navigate(-1);
      }}
      pageTitle={intl.formatMessage({
        id: "role",
        defaultMessage: "Role",
      })}
      appBarContent={
        <div>
          {tab === "main" && (
            <Zoom key={tab} in={tab === "main"}>
              <div>
                <IconButton
                  disabled={
                    (!uid && !isAuthGranted(auth, `create_${singular}`)) ||
                    !isAuthGranted(auth, `edit_${singular}`)
                  }
                  color="inherit"
                  onClick={(e) => submit(e)}
                >
                  <Save />
                </IconButton>
                <IconButton
                  disabled={!uid || !isAuthGranted(auth, `delete_${singular}`)}
                  color="inherit"
                  onClick={() => {
                    openDeleteDialog();
                  }}
                >
                  <Delete />
                </IconButton>
              </div>
            </Zoom>
          )}
          {tab !== "main" && (
            <Zoom key={tab} in={tab !== "main"}>
              <div>
                <SearchField
                  initialValue={searchValue}
                  onChange={(v) => {
                    setSearch(tab, v);
                  }}
                />
              </div>
            </Zoom>
          )}
        </div>
      }
      tabs={
        <Box>
          <Tabs
            value={tab}
            onChange={(e, t) => {
              navigate(`/roles/${uid}/${t}`, { replace: true });
            }}
            centered
          >
            <Tab value="main" icon={<AccountBox color="inherit" />} />

            <Tab value="grants" icon={<Lock />} />
          </Tabs>
          <Divider />
        </Box>
      }
    >
      <div style={{ height: "100%", overflow: "hidden" }}>
        <div style={{ height: "100%" }}>
          {tab === "main" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <FirebaseFromContainer
                path={`${path}`}
                uid={uid!}
                setSubmit={setSubmit}
                handleSubmit={(values, newUid) => {
                  if (newUid) {
                    navigate(`/${path}/${newUid}`, { replace: true });
                  } else {
                    navigate(`/${path}`);
                  }
                }}
                // TODO check - it was Form instead of FormsRole but was not imported from anywhere
                Form={FormsRole}
              />
            </div>
          )}

          {tab === "grants" && <GrantsListContainer grantsPath={grantsPath} />}
        </div>
      </div>
    </Page>
  );
}
