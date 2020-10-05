import { get } from "lodash";
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

import Button from "antd/lib/button";
import Form from "antd/lib/form";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import LoadingState from "@/components/items-list/components/LoadingState";
import wrapSettingsTab from "@/components/SettingsWrapper";

import recordEvent from "@/services/recordEvent";
import OrgSettings from "@/services/organizationSettings";
import routes from "@/services/routes";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";
import { getHorizontalFormProps, getHorizontalFormItemWithoutLabelProps } from "@/styles/formStyle";

import GeneralSettings from "./components/GeneralSettings";
import AuthSettings from "./components/AuthSettings";

function OrganizationSettings({ onError }) {
  const [settings, setSettings] = useState({});
  const [currentValues, setCurrentValues] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleError = useImmutableCallback(onError);

  useEffect(() => {
    recordEvent("view", "page", "org_settings");

    let isCancelled = false;

    OrgSettings.get()
      .then(response => {
        if (!isCancelled) {
          const settings = get(response, "settings");
          setSettings(settings);
          setCurrentValues({ ...settings });
          setIsLoading(false);
        }
      })
      .catch(error => {
        if (!isCancelled) {
          handleError(error);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [handleError]);

  const handleChange = useCallback(changes => {
    setCurrentValues(currentValues => ({ ...currentValues, ...changes }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!isSaving) {
      setIsSaving(true);
      OrgSettings.save(currentValues)
        .then(response => {
          const settings = get(response, "settings");
          setSettings(settings);
          setCurrentValues({ ...settings });
        })
        .catch(handleError)
        .finally(() => setIsSaving(false));
    }
<<<<<<< HEAD
  }, [isSaving, currentValues, handleError]);

  return (
    <div className="row" data-test="OrganizationSettings">
      <div className="m-r-20 m-l-20">
        {isLoading ? (
          <LoadingState className="" />
        ) : (
          <Form {...getHorizontalFormProps()} onFinish={handleSubmit}>
            <GeneralSettings settings={settings} values={currentValues} onChange={handleChange} />
            <AuthSettings settings={settings} values={currentValues} onChange={handleChange} />
            <Form.Item {...getHorizontalFormItemWithoutLabelProps()}>
              <Button type="primary" htmlType="submit" loading={isSaving}>
=======
  };

  handleChange = (name, value) => {
    this.setState(
      prevState => ({ formValues: Object.assign(prevState.formValues, { [name]: value }) }),
      () => {
        if (this.disablePasswordLoginToggle() && !this.state.formValues.auth_password_login_enabled) {
          this.handleChange("auth_password_login_enabled", true);
        }
      }
    );
  };

  renderGoogleLoginOptions() {
    const { formValues } = this.state;
    return (
      <React.Fragment>
        <h4>Google Login</h4>
        <Form.Item label="Allowed Google Apps Domains">
          <Select
            mode="tags"
            value={formValues.auth_google_apps_domains}
            onChange={value => this.handleChange("auth_google_apps_domains", value)}
          />
          {!isEmpty(formValues.auth_google_apps_domains) && (
            <Alert
              message={
                <p>
                  Any user registered with a <strong>{join(formValues.auth_google_apps_domains, ", ")}</strong> Google
                  Apps account will be able to login. If they don{"'"}t have an existing user, a new user will be
                  created and join the <strong>Default</strong> group.
                </p>
              }
              className="m-t-15"
            />
          )}
        </Form.Item>
      </React.Fragment>
    );
  }

  renderSAMLOptions() {
    const { formValues } = this.state;
    return (
      <React.Fragment>
        <h4>SAML</h4>
        <Form.Item>
          <Checkbox
            name="auth_saml_enabled"
            checked={formValues.auth_saml_enabled}
            onChange={e => this.handleChange("auth_saml_enabled", e.target.checked)}>
            SAML Enabled
          </Checkbox>
        </Form.Item>
        {formValues.auth_saml_enabled && (
          <div>
            <Form.Item label="SAML Metadata URL">
              <Input
                value={formValues.auth_saml_metadata_url}
                onChange={e => this.handleChange("auth_saml_metadata_url", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="SAML Entity ID">
              <Input
                value={formValues.auth_saml_entity_id}
                onChange={e => this.handleChange("auth_saml_entity_id", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="SAML NameID Format">
              <Input
                value={formValues.auth_saml_nameid_format}
                onChange={e => this.handleChange("auth_saml_nameid_format", e.target.value)}
              />
            </Form.Item>
          </div>
        )}
      </React.Fragment>
    );
  }

  renderGeneralSettings() {
    const { formValues } = this.state;
    return (
      <React.Fragment>
        <h3 className="m-t-0">General</h3>
        <hr />
        <Form.Item label="Date Format">
          <Select
            value={formValues.date_format}
            onChange={value => this.handleChange("date_format", value)}
            data-test="DateFormatSelect">
            {clientConfig.dateFormatList.map(dateFormat => (
              <Option key={dateFormat}>{dateFormat}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Time Format">
          <Select
            value={formValues.time_format}
            onChange={value => this.handleChange("time_format", value)}
            data-test="TimeFormatSelect">
            {clientConfig.timeFormatList.map(timeFormat => (
              <Option key={timeFormat}>{timeFormat}</Option>
            ))}
          </Select>
        </Form.Item>
      {/*
        <Form.Item label="Chart Visualization">
          <Checkbox
            name="hide_plotly_mode_bar"
            checked={formValues.hide_plotly_mode_bar}
            onChange={e => this.handleChange("hide_plotly_mode_bar", e.target.checked)}>
            Hide Plotly mode bar
          </Checkbox>
        </Form.Item>
        <Form.Item label="Feature Flags">
          <Checkbox
            name="feature_show_permissions_control"
            checked={formValues.feature_show_permissions_control}
            onChange={e => this.handleChange("feature_show_permissions_control", e.target.checked)}>
            Enable experimental multiple owners support
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Checkbox
            name="send_email_on_failed_scheduled_queries"
            checked={formValues.send_email_on_failed_scheduled_queries}
            onChange={e => this.handleChange("send_email_on_failed_scheduled_queries", e.target.checked)}>
            Email query owners when scheduled queries fail
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Checkbox
            name="multi_byte_search_enabled"
            checked={formValues.multi_byte_search_enabled}
            onChange={e => this.handleChange("multi_byte_search_enabled", e.target.checked)}>
            Enable multi-byte (Chinese, Japanese, and Korean) search for query names and descriptions (slower)
          </Checkbox>
        </Form.Item>
      */}
      </React.Fragment>
    );
  }

  renderAuthSettings() {
    const { settings, formValues } = this.state;
    return (
      <React.Fragment>
        <h3 className="m-t-0">
          Authentication <HelpTrigger type="AUTHENTICATION_OPTIONS" />
        </h3>
        <hr />
        {!settings.auth_password_login_enabled && (
          <Alert
            message="Password based login is currently disabled and users will
            be able to login only with the enabled SSO options."
            type="warning"
            className="m-t-15 m-b-15"
          />
        )}
        <Form.Item>
          <Checkbox
            checked={formValues.auth_password_login_enabled}
            disabled={this.disablePasswordLoginToggle()}
            onChange={e => this.handleChange("auth_password_login_enabled", e.target.checked)}>
            <Tooltip
              title={
                this.disablePasswordLoginToggle()
                  ? "Password login can be disabled only if another login method is enabled."
                  : null
              }
              placement="right">
              Password Login Enabled
            </Tooltip>
          </Checkbox>
        </Form.Item>
        {clientConfig.googleLoginEnabled && this.renderGoogleLoginOptions()}
        {this.renderSAMLOptions()}
      </React.Fragment>
    );
  }

  render() {
    const { loading, submitting } = this.state;
    return (
      <div className="row" data-test="OrganizationSettings">
        <div className="col-md-offset-4 col-md-4">
          {loading ? (
            <LoadingState className="" />
          ) : (
            <Form layout="vertical" onSubmit={this.handleSubmit}>
              {this.renderGeneralSettings()}
              {this.renderAuthSettings()}
              <Button className="w-100" type="primary" htmlType="submit" loading={submitting}>
>>>>>>> 122be43fdc9e7f60b41aaa1eba54a53c8b28e63a
                Save
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
}

OrganizationSettings.propTypes = {
  onError: PropTypes.func,
};

OrganizationSettings.defaultProps = {
  onError: () => {},
};

const OrganizationSettingsPage = wrapSettingsTab(
  "Settings.Organization",
  {
    permission: "admin",
    title: "General",
    path: "settings/general",
    order: 6,
  },
  OrganizationSettings
);

routes.register(
  "Settings.Organization",
  routeWithUserSession({
    path: "/settings/general",
    title: "General Settings",
    render: pageProps => <OrganizationSettingsPage {...pageProps} />,
  })
);
